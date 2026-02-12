import { query } from "./index";
import { Restaurant } from "../types/domain";

export async function listRestaurants(): Promise<Restaurant[]> {
  const sql = `
    SELECT id, owner_id, name, description
    FROM restaurants
    ORDER BY id DESC
  `;
  const { rows } = await query<Restaurant>(sql, []);
  return rows;
}

export async function getRestaurantById(id: number): Promise<Restaurant | null> {
  const sql = `
    SELECT id, owner_id, name, description
    FROM restaurants
    WHERE id = $1
  `;
  const { rows } = await query<Restaurant>(sql, [id]);
  return rows[0] ?? null;
}

export async function createRestaurant(
  ownerId: number,
  name: string,
  description: string | null
): Promise<Restaurant> {
  const sql = `
    INSERT INTO restaurants (owner_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING id, owner_id, name, description
  `;
  const { rows } = await query<Restaurant>(sql, [ownerId, name, description]);
  return rows[0];
}

export async function updateRestaurant(
  id: number,
  ownerId: number,
  name: string,
  description: string | null
): Promise<Restaurant | null> {
  const sql = `
    UPDATE restaurants
    SET name = $3,
        description = $4
    WHERE id = $1 AND owner_id = $2
    RETURNING id, owner_id, name, description
  `;
  const { rows } = await query<Restaurant>(sql, [id, ownerId, name, description]);
  return rows[0] ?? null;
}