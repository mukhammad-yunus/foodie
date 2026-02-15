"use client";

import useSWR from "swr";
import Link from "next/link";
import { api } from "../../src/lib/api";

interface Restaurant {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
}

async function fetchRestaurants(): Promise<{ restaurants: Restaurant[] }> {
  return api("/api/restaurants");
}

export default function RestaurantsPage() {
  const { data, error } = useSWR("restaurants", fetchRestaurants);

  if (error) {
    return <p className="text-red-600">Failed to load restaurants.</p>;
  }
  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Restaurants</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {data.restaurants.map((r) => (
          <Link
            key={r.id}
            href={`/restaurants/${r.id}`}
            className="block bg-white p-4 rounded shadow hover:shadow-md"
          >
            <h2 className="font-semibold text-lg">{r.name}</h2>
            <p className="text-sm text-slate-700">
              {r.description || "No description"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}