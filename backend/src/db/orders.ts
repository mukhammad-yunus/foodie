import { query } from "./index";
import { Order, OrderItem } from "../types/domain";

interface NewOrderItemInput {
  item_id: number;
  quantity: number;
  price_snapshot: number;
}

export async function createOrderWithItems(
  userId: number,
  addressId: number,
  items: NewOrderItemInput[]
): Promise<{ order: Order; orderItems: OrderItem[] }> {
  // Simple transaction usingBEGIN/COMMIT
  await query("BEGIN");

  try {
    const orderSql = `
      INSERT INTO orders (user_id, address_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING id, user_id, address_id, status, created_at
    `;
    const { rows: orderRows } = await query<Order>(orderSql, [userId, addressId]);
    const order = orderRows[0];

    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const orderItemSql = `
        INSERT INTO order_items (order_id, item_id, quantity, price_snapshot)
        VALUES ($1, $2, $3, $4)
        RETURNING id, order_id, item_id, quantity, price_snapshot
      `;
      const { rows } = await query<OrderItem>(orderItemSql, [
        order.id,
        item.item_id,
        item.quantity,
        item.price_snapshot
      ]);
      orderItems.push(rows[0]);
    }

    await query("COMMIT");

    return { order, orderItems };
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
}

export async function listOrdersForUser(userId: number): Promise<Order[]> {
  const sql = `
    SELECT id, user_id, address_id, status, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const { rows } = await query<Order>(sql, [userId]);
  return rows;
}