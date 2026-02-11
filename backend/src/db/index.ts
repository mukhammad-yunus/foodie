import dotenv from "dotenv";
import { Pool, QueryResultRow } from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env");
}

export const pool = new Pool({
  connectionString,
});

/**
 * - text: SQL text with $1, $2 placeholders
 * - params: array of values to safely insert into query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = [],
): Promise<{ rows: T[] }> {
  const result = await pool.query<T>(text, params);
  return result;
}
