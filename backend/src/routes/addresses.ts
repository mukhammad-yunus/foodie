import { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth";
import { handleValidationErrors } from "../utils/validation";
import { listAddressesForUser, createAddress, deleteAddress } from "../db/addresses";

const router = Router();

// GET /api/addresses
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const addresses = await listAddressesForUser(userId);
  res.json({ addresses });
});

// POST /api/addresses
router.post(
  "/",
  requireAuth,
  [
    body("label").notEmpty().withMessage("Label is required"),
    body("street").notEmpty().withMessage("Street is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("postal_code").notEmpty().withMessage("Postal code is required")
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { label, street, city, postal_code } = req.body;

    const address = await createAddress(userId, label, street, city, postal_code);
    res.status(201).json({ address });
  }
);

// DELETE /api/addresses/:id
router.delete(
  "/:id",
  requireAuth,
  [param("id").isInt().withMessage("Address id must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = Number(req.params.id);

    await deleteAddress(id, userId);
    res.status(204).send();
  }
);

export default router;