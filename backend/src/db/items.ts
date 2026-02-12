import { query } from "./index";
import { Item } from "../types/domain";

export async function listItemsForRestaurant(restaurantId: number): Promise<Item[]> {
  const sql = `
    SELECT id, restaurant_id, name, description, price
    FROM items
    WHERE restaurant_id = $1
    ORDER BY id
  `;
  const { rows } = await query<Item>(sql, [restaurantId]);
  return rows;
}

export async function createItem(
  restaurantId: number,
  name: string,
  description: string | null,
  price: number
): Promise<Item> {
  const sql = `
    INSERT INTO items (restaurant_id, name, description, price)
    VALUES ($1, $2, $3, $4)
    RETURNING id, restaurant_id, name, description, price
  `;
  const { rows } = await query<Item>(sql, [restaurantId, name, description, price]);
  return rows[0];
}

export async function updateItem(
  id: number,
  ownerRestaurantId: number,
  name: string,
  description: string | null,
  price: number
): Promise<Item | null> {
  const sql = `
    UPDATE items
    SET name = $3,
        description = $4,
        price = $5
    WHERE id = $1 AND restaurant_id = $2
    RETURNING id, restaurant_id, name, description, price
  `;
  const { rows } = await query<Item>(sql, [id, ownerRestaurantId, name, description, price]);
  return rows[0] ?? null;
}

export async function deleteItem(id: number, ownerRestaurantId: number): Promise<void> {
  const sql = `
    DELETE FROM items
    WHERE id = $1 AND restaurant_id = $2
  `;
  await query(sql, [id, ownerRestaurantId]);
}