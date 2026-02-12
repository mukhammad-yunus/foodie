import { Router, Request, Response } from "express";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import { handleValidationErrors } from "../utils/validation";
import { createUser, findUserByEmail } from "../db/users";
import { UserRole } from "../types/domain";

const router = Router();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

// POST /api/auth/register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["customer", "owner"]).withMessage("Role must be 'customer' or 'owner'")
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { email, password, role } = req.body as { email: string; password: string; role: UserRole };

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await createUser(email, passwordHash, role);

    // Put minimal user info into the session
    const anyReq = req as any;
    anyReq.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const anyReq = req as any;
    anyReq.session.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  }
);

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  const anyReq = req as any;

  anyReq.session.destroy((err: any) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.clearCookie("connect.sid");
    res.status(204).send();
  });
});

export default router;