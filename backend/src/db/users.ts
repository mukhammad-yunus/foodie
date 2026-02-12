import { query } from "./index";
import { User, UserRole } from "../types/domain";

export async function createUser(email: string, passwordHash: string, role: UserRole): Promise<User> {
  const sql = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, password_hash, role, created_at
  `;
  const { rows } = await query<User>(sql, [email, passwordHash, role]);
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT id, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
  `;
  const { rows } = await query<User>(sql, [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const sql = `
    SELECT id, email, password_hash, role, created_at
    FROM users
    WHERE id = $1
  `;
  const { rows } = await query<User>(sql, [id]);
  return rows[0] ?? null;
}