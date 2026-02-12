import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireRole } from "../middleware/auth";
import { handleValidationErrors } from "../utils/validation";
import { createOrderWithItems, listOrdersForUser } from "../db/orders";

const router = Router();

// GET /api/orders (customer only)
router.get("/", requireRole("customer"), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orders = await listOrdersForUser(userId);
  res.json({ orders });
});

// POST /api/orders (customer only)
router.post(
  "/",
  requireRole("customer"),
  [
    body("address_id").isInt().withMessage("address_id is required"),
    body("items").isArray({ min: 1 }).withMessage("items is required and must not be empty"),
    body("items.*.item_id").isInt().withMessage("item_id must be an integer"),
    body("items.*.quantity").isInt({ gt: 0 }).withMessage("quantity must be > 0"),
    body("items.*.price_snapshot").isInt({ gt: 0 }).withMessage("price_snapshot must be > 0")
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { address_id, items } = req.body;

    const { order, orderItems } = await createOrderWithItems(userId, address_id, items);
    res.status(201).json({ order, orderItems });
  }
);

export default router;