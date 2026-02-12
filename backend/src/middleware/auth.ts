import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/domain";


export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const anyReq = req as any;

  if (!anyReq.session || !anyReq.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Attach user to req for convenience
  req.user = anyReq.session.user;
  next();
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const anyReq = req as any;
    const sessionUser = anyReq.session?.user;

    if (!sessionUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (sessionUser.role !== role) {
      return res.status(403).json({ error: "Forbidden: wrong role" });
    }

    req.user = sessionUser;
    next();
  };
}