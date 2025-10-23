import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
    }
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser(req.userId);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (user.isDisabled) {
      return res.status(403).json({ error: "Account is disabled" });
    }

    req.isAdmin = true;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Authorization error" });
  }
}
