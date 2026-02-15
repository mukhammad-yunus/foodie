"use client";

import useSWR from "swr";
import { api } from "../../src/lib/api";
import { useAuth } from "../../src/lib/auth-context";

interface Order {
  id: number;
  status: string;
  created_at: string;
}

async function fetchOrders(): Promise<{ orders: Order[] }> {
  return api("/api/orders");
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { data, error } = useSWR(user ? "orders" : null, fetchOrders);

  if (!user) {
    return <p>You must be logged in as a customer.</p>;
  }

  if (error) {
    return <p className="text-red-600">Failed to load orders.</p>;
  }

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Orders</h1>
      {data.orders.length === 0 && <p>No orders yet.</p>}
      <ul className="space-y-2">
        {data.orders.map((o) => (
          <li key={o.id} className="bg-white p-3 rounded shadow">
            <p>Order #{o.id}</p>
            <p className="text-sm text-slate-700">
              Status: {o.status} | Created:{" "}
              {new Date(o.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}