import { query } from "./index";
import { Address } from "../types/domain";

export async function listAddressesForUser(userId: number): Promise<Address[]> {
  const sql = `
    SELECT id, user_id, label, street, city, postal_code
    FROM addresses
    WHERE user_id = $1
    ORDER BY id DESC
  `;
  const { rows } = await query<Address>(sql, [userId]);
  return rows;
}

export async function createAddress(
  userId: number,
  label: string,
  street: string,
  city: string,
  postalCode: string
): Promise<Address> {
  const sql = `
    INSERT INTO addresses (user_id, label, street, city, postal_code)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, label, street, city, postal_code
  `;
  const { rows } = await query<Address>(sql, [userId, label, street, city, postalCode]);
  return rows[0];
}

export async function deleteAddress(id: number, userId: number): Promise<void> {
  const sql = `
    DELETE FROM addresses
    WHERE id = $1 AND user_id = $2
  `;
  await query(sql, [id, userId]);
}