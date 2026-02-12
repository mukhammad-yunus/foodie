import { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import { requireAuth, requireRole } from "../middleware/auth";
import { handleValidationErrors } from "../utils/validation";
import { listRestaurants, getRestaurantById, createRestaurant, updateRestaurant } from "../db/restaurants";
import { listItemsForRestaurant, createItem, updateItem, deleteItem } from "../db/items";

const router = Router();

// GET /api/restaurants
router.get("/", async (_req: Request, res: Response) => {
  const restaurants = await listRestaurants();
  res.json({ restaurants });
});

// GET /api/restaurants/:id
router.get(
  "/:id",
  [param("id").isInt().withMessage("Restaurant id must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const restaurant = await getRestaurantById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    const items = await listItemsForRestaurant(id);
    res.json({ restaurant, items });
  }
);

// POST /api/restaurants (owner only)
router.post(
  "/",
  requireRole("owner"),
  [body("name").notEmpty().withMessage("Name is required")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const { name, description } = req.body;
    const restaurant = await createRestaurant(ownerId, name, description ?? null);
    res.status(201).json({ restaurant });
  }
);

// PUT /api/restaurants/:id (owner only)
router.put(
  "/:id",
  requireRole("owner"),
  [
    param("id").isInt().withMessage("Restaurant id must be an integer"),
    body("name").notEmpty().withMessage("Name is required")
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const restaurant = await updateRestaurant(id, ownerId, name, description ?? null);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found or not yours" });
    }
    res.json({ restaurant });
  }
);

// POST /api/restaurants/:id/items (owner only)
router.post(
  "/:id/items",
  requireRole("owner"),
  [
    param("id").isInt().withMessage("Restaurant id must be an integer"),
    body("name").notEmpty().withMessage("Name is required"),
    body("price").isInt({ gt: 0 }).withMessage("Price must be a positive integer (cents)")
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const ownerId = req.user!.id;
    const restaurantId = Number(req.params.id);
    const { name, description, price } = req.body;

    // Optional: verify restaurant belongs to owner via updateRestaurant or a dedicated check.
    const item = await createItem(restaurantId, name, description ?? null, price);
    res.status(201).json({ item });
  }
);

// PUT /api/restaurants/:restaurantId/items/:itemId (owner only)
router.put(
  "/:restaurantId/items/:itemId",
  requireRole("owner"),
  [
    param("restaurantId").isInt(),
    param("itemId").isInt(),
    body("name").notEmpty(),
    body("price").isInt({ gt: 0 })
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const itemId = Number(req.params.itemId);
    const { name, description, price } = req.body;

    const item = await updateItem(itemId, restaurantId, name, description ?? null, price);
    if (!item) {
      return res.status(404).json({ error: "Item not found or not yours" });
    }
    res.json({ item });
  }
);

// DELETE /api/restaurants/:restaurantId/items/:itemId (owner only)
router.delete(
  "/:restaurantId/items/:itemId",
  requireRole("owner"),
  [param("restaurantId").isInt(), param("itemId").isInt()],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const itemId = Number(req.params.itemId);

    await deleteItem(itemId, restaurantId);
    res.status(204).send();
  }
);

export default router;