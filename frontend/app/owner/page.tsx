"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { api } from "../../src/lib/api";
import { useAuth } from "../../src/lib/auth-context";

interface Restaurant {
  id: number;
  owner_id: number;
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

interface RestaurantWithItems {
  restaurant: Restaurant;
  items: Item[];
}

async function fetchFirstRestaurant(): Promise<RestaurantWithItems | null> {
  const { restaurants } = await api<{ restaurants: Restaurant[] }>("/api/restaurants");
  if (restaurants.length === 0) return null;
  const first = restaurants.find((r) => r.id)!;
  const details = await api<RestaurantWithItems>(`/api/restaurants/${first.id}`);
  return details;
}

export default function OwnerPage() {
  const { user } = useAuth();
  const { data, error, mutate } = useSWR(
    user?.role === "owner" ? "owner-restaurant" : null,
    fetchFirstRestaurant
  );

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState(999);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "owner") {
    return <p>You must be logged in as an owner.</p>;
  }

  async function handleCreateRestaurant(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      await api("/api/restaurants", {
        method: "POST",
        body: JSON.stringify({ name, description: desc })
      });
      setName("");
      setDesc("");
      await mutate();
    } catch (err: any) {
      setFormError(err.error || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!data?.restaurant) return;
    setFormError(null);
    setLoading(true);
    try {
      await api(`/api/restaurants/${data.restaurant.id}/items`, {
        method: "POST",
        body: JSON.stringify({
          name: itemName,
          description: itemDesc,
          price: itemPrice
        })
      });
      setItemName("");
      setItemDesc("");
      setItemPrice(999);
      await mutate();
    } catch (err: any) {
      setFormError(err.error || "Failed to add item");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return <p className="text-red-600">Failed to load data.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>
      {formError && <p className="text-red-600 text-sm">{formError}</p>}
      {!data ? (
        <p>Loading...</p>
      ) : !data.restaurant ? (
        <div>
          <p>You have no restaurant yet. Create one:</p>
          <form onSubmit={handleCreateRestaurant} className="space-y-2 max-w-md mt-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create restaurant"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Your restaurant</h2>
            <p className="font-semibold">{data.restaurant.name}</p>
            <p className="text-sm text-slate-700">
              {data.restaurant.description || "No description"}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Menu items</h3>
            {data.items.length === 0 && <p>No items yet.</p>}
            <ul className="space-y-2 mt-2">
              {data.items.map((item) => (
                <li key={item.id} className="bg-white p-3 rounded shadow">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-700">
                    {item.description || "No description"}
                  </p>
                  <p className="text-sm">
                    {(item.price / 100).toFixed(2)} €
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Add new item</h3>
            <form onSubmit={handleAddItem} className="space-y-2 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (cents)
                </label>
                <input
                  type="number"
                  min={1}
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button
                disabled={loading}
                className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}