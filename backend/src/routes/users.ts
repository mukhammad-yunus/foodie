import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;