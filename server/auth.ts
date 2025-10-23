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
      // Verify the Firebase ID token
      const decodedToken = await getAuth().verifyIdToken(idToken);
      req.userId = decodedToken.uid;
      next();
    } catch (error) {
      // In development mode, allow requests without strict token verification
      // This is for demo purposes only - remove in production
      if (process.env.NODE_ENV === "development") {
        // Extract userId from query or body as fallback in development
        const userId = (req.query.userId || req.body?.userId) as string;
        if (userId) {
          req.userId = userId;
          return next();
        }
      }
      return res.status(401).json({ error: "Invalid authentication token" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Authentication error" });
  }
}
