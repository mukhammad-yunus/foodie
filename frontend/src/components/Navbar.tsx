"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-lg">
          Foodie
        </Link>
        {!loading && (
          <>
            <Link href="/restaurants">Restaurants</Link>
            {user?.role === "customer" && (
              <>
                <Link href="/cart">Cart</Link>
                <Link href="/orders">Orders</Link>
                <Link href="/addresses">Addresses</Link>
              </>
            )}
            {user?.role === "owner" && <Link href="/owner">Owner Dashboard</Link>}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            <span className="text-sm">
              {user.email} ({user.role})
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}