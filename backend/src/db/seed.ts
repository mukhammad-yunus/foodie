import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { query } from "./index";

async function main() {
  const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

  console.log("Clearing existing data...");
  await query("DELETE FROM order_items");
  await query("DELETE FROM orders");
  await query("DELETE FROM items");
  await query("DELETE FROM restaurants");
  await query("DELETE FROM addresses");
  await query("DELETE FROM users");

  console.log("Creating users...");
  const passwordHash = await bcrypt.hash("password123", BCRYPT_ROUNDS);

  // Customer
  const customerRes = await query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'customer')
      RETURNING id
    `,
    ["customer@test.com", passwordHash]
  );
  const customerId = customerRes.rows[0].id as number;

  // Owner
  const ownerRes = await query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'owner')
      RETURNING id
    `,
    ["owner@test.com", passwordHash]
  );
  const ownerId = ownerRes.rows[0].id as number;

  console.log("Creating address for customer...");
  const addressRes = await query(
    `
      INSERT INTO addresses (user_id, label, street, city, postal_code)
      VALUES ($1, 'Home', '123 Main St', 'Sample City', '12345')
      RETURNING id
    `,
    [customerId]
  );
  const addressId = addressRes.rows[0].id as number;

  console.log("Creating restaurant for owner...");
  const restaurantRes = await query(
    `
      INSERT INTO restaurants (owner_id, name, description)
      VALUES ($1, 'Tasty Bites', 'Delicious sample food')
      RETURNING id
    `,
    [ownerId]
  );
  const restaurantId = restaurantRes.rows[0].id as number;

  console.log("Creating menu items...");
  await query(
    `
      INSERT INTO items (restaurant_id, name, description, price)
      VALUES
        ($1, 'Burger', 'Juicy burger', 999),
        ($1, 'Fries', 'Crispy fries', 499),
        ($1, 'Soda', 'Cold drink', 199)
    `,
    [restaurantId]
  );

  console.log("Seeding done.");
}

main()
  .then(() => {
    console.log("Seed script finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
  });