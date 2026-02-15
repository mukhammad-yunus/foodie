"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { api } from "../../src/lib/api";
import { useAuth } from "../../src/lib/auth-context";

interface Address {
  id: number;
  label: string;
  street: string;
  city: string;
  postal_code: string;
}

async function fetchAddresses(): Promise<{ addresses: Address[] }> {
  return api("/api/addresses");
}

export default function AddressesPage() {
  const { user } = useAuth();
  const { data, error, mutate } = useSWR(
    user ? "addresses" : null,
    fetchAddresses
  );

  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <p>You must be logged in.</p>;
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await api("/api/addresses", {
        method: "POST",
        body: JSON.stringify({
          label,
          street,
          city,
          postal_code: postal
        })
      });
      setLabel("");
      setStreet("");
      setCity("");
      setPostal("");
      await mutate(); // refresh list
    } catch (err: any) {
      setFormError(err.error || "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api(`/api/addresses/${id}`, {
        method: "DELETE"
      });
      await mutate();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Addresses</h1>

      {error && (
        <p className="text-red-600 text-sm">
          Failed to load addresses.
        </p>
      )}

      {data && (
        <ul className="space-y-2">
          {data.addresses.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between bg-white p-3 rounded shadow"
            >
              <div>
                <p className="font-semibold">{a.label}</p>
                <p className="text-sm text-slate-700">
                  {a.street}, {a.city} ({a.postal_code})
                </p>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
              >
                Delete
              </button>
            </li>
          ))}
          {data.addresses.length === 0 && <p>No addresses yet.</p>}
        </ul>
      )}

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Add new address</h2>
        {formError && (
          <p className="text-red-600 text-sm mb-2">{formError}</p>
        )}
        <form onSubmit={handleAdd} className="space-y-2 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Street
            </label>
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              City
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Postal code
            </label>
            <input
              value={postal}
              onChange={(e) => setPostal(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button
            disabled={submitting}
            className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save address"}
          </button>
        </form>
      </div>
    </div>
  );
}