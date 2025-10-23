import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  // In development, we'll use a simple authentication bypass for demo purposes
  // In production, you would configure proper Firebase Admin credentials
  try {
    initializeApp();
  } catch (error) {
    console.warn("Firebase Admin SDK not initialized - using development mode");
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
