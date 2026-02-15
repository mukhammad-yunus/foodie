"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../src/lib/cart-context";
import { useAuth } from "../../src/lib/auth-context";
import { api } from "../../src/lib/api";

interface Address {
  id: number;
  label: string;
  street: string;
  city: string;
  postal_code: string;
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalCents, updateQuantity, removeItem, clear } = useCart();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAddresses() {
    if (!user) {
      setError("You must be logged in as a customer.");
      return;
    }
    setLoadingAddresses(true);
    try {
      const data = await api<{ addresses: Address[] }>("/api/addresses");
      setAddresses(data.addresses);
      if (data.addresses.length > 0) {
        setAddressId(data.addresses[0].id);
      }
    } catch (err: any) {
      setError(err.error || "Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  }

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    if (!addressId) {
      setError("Please select an address.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setPlacingOrder(true);
    setError(null);
    try {
      const body = {
        address_id: addressId,
        items: items.map((i) => ({
          item_id: i.item_id,
          quantity: i.quantity,
          price_snapshot: i.price
        }))
      };
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(body)
      });
      clear();
      router.push("/orders");
    } catch (err: any) {
      setError(err.error || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  }

  const totalFormatted = (totalCents / 100).toFixed(2);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cart</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.item_id}
                className="flex items-center justify-between bg-white p-3 rounded shadow"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm">
                    Price: {(item.price / 100).toFixed(2)} €
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.item_id, Number(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => removeItem(item.item_id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="font-semibold">
            Total: {totalFormatted} €
          </p>
        </div>
      )}

      <div className="border-t pt-4 space-y-3">
        <h2 className="text-xl font-semibold">Checkout</h2>
        <button
          onClick={loadAddresses}
          disabled={loadingAddresses}
          className="px-3 py-1 bg-slate-900 text-white rounded text-sm"
        >
          {loadingAddresses ? "Loading addresses..." : "Load my addresses"}
        </button>

        {addresses && addresses.length === 0 && (
          <p className="text-sm">
            You have no addresses. Please add one on the{" "}
            <a href="/addresses" className="text-blue-600 underline">
              Addresses page
            </a>
            .
          </p>
        )}

        {addresses && addresses.length > 0 && (
          <form onSubmit={handlePlaceOrder} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Select address
              </label>
              <select
                value={addressId ?? ""}
                onChange={(e) => setAddressId(Number(e.target.value))}
                className="border rounded px-3 py-2"
                required
              >
                <option value="">Choose...</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} - {a.street}, {a.city} ({a.postal_code})
                  </option>
                ))}
              </select>
            </div>
            <button
              disabled={placingOrder || items.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
            >
              {placingOrder ? "Placing order..." : "Place order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}