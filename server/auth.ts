import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    // Check for service account credentials in environment variables
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (serviceAccountBase64) {
      // Option 1: Base64-encoded service account JSON
      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
      );
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin initialized with base64 service account");
    } else if (projectId && clientEmail && privateKey) {
      // Option 2: Individual environment variables
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
      console.log("Firebase Admin initialized with environment variables");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Option 3: Service account file path
      initializeApp();
      console.log("Firebase Admin initialized with service account file");
    } else if (process.env.NODE_ENV === "development") {
      // Development fallback
      initializeApp();
      console.warn("Firebase Admin SDK initialized in development mode without credentials");
    } else {
      throw new Error("Missing Firebase Admin credentials. Please set FIREBASE_SERVICE_ACCOUNT_BASE64, individual credential env vars, or GOOGLE_APPLICATION_CREDENTIALS");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get the Firebase ID token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      // Try to verify the Firebase ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      req.userId = decodedToken.uid;
      next();
    } catch (verifyError) {
      // In development mode, decode the token without verification
      // This is for demo purposes when Firebase Admin SDK is not fully configured
      if (process.env.NODE_ENV === "development") {
        try {
          // Decode the token without verification to extract the uid
          const base64Payload = idToken.split('.')[1];
          const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
          
          if (payload.user_id) {
            req.userId = payload.user_id;
            return next();
          }
        } catch (decodeError) {
          console.warn("Failed to decode token in development mode:", decodeError);
        }
      }
      return res.status(401).json({ error: "Invalid authentication token" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Authentication error" });
  }
}
