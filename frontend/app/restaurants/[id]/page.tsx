"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { api } from "../../../src/lib/api";
import { useCart } from "../../../src/lib/cart-context";

interface Restaurant {
  id: number;
  name: string;
  description: string | null;
}

interface Item {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: number;
}

interface RestaurantResponse {
  restaurant: Restaurant;
  items: Item[];
}

async function fetchRestaurant(id: string): Promise<RestaurantResponse> {
  return api(`/api/restaurants/${id}`);
}

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();

  const { data, error } = useSWR(
    params.id ? `restaurant-${params.id}` : null,
    () => fetchRestaurant(params.id)
  );

  if (error) {
    return <p className="text-red-600">Failed to load restaurant.</p>;
  }
  if (!data) {
    return <p>Loading...</p>;
  }

  const { restaurant, items } = data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-slate-700">
          {restaurant.description || "No description"}
        </p>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Menu</h2>
        {items.length === 0 && <p>No items yet.</p>}
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-white p-3 rounded shadow"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-slate-700">
                  {item.description || "No description"}
                </p>
                <p className="text-sm font-medium">
                  {(item.price / 100).toFixed(2)} €
                </p>
              </div>
              <button
                onClick={() =>
                  addItem(
                    {
                      item_id: item.id,
                      name: item.name,
                      price: item.price
                    },
                    1
                  )
                }
                className="px-3 py-1 bg-slate-900 text-white rounded text-sm"
              >
                Add to cart
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}