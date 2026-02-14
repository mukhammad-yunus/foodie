"use client";

import Link from "next/link";
import { useAuth } from "../src/lib/auth-context";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Foodie</h1>
        <p>Please log in or register to start ordering food.</p>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-4 py-2 bg-slate-900 text-white rounded"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "customer") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome, customer!</h1>
        <p>What would you like to do?</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <Link href="/restaurants" className="text-blue-600 underline">
              Browse restaurants
            </Link>
          </li>
          <li>
            <Link href="/cart" className="text-blue-600 underline">
              View cart
            </Link>
          </li>
          <li>
            <Link href="/orders" className="text-blue-600 underline">
              View orders
            </Link>
          </li>
          <li>
            <Link href="/addresses" className="text-blue-600 underline">
              Manage addresses
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  // owner
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome, owner!</h1>
      <p>Manage your restaurant and menu.</p>
      <Link href="/owner" className="text-blue-600 underline">
        Go to owner dashboard
      </Link>
    </div>
  );
}