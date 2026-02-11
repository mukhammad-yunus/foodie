export type UserRole = "customer" | "owner";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

export interface Address {
  id: number;
  user_id: number;
  label: string;
  street: string;
  city: string;
  postal_code: string;
}

export interface Restaurant {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
}

export interface Item {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number; // stored in cents or integer
}

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface Order {
  id: number;
  user_id: number;
  address_id: number;
  status: OrderStatus;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  price_snapshot: number;
}