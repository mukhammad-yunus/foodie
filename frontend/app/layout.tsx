import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../src/lib/auth-context";
import { CartProvider } from "../src/lib/cart-context";
import Navbar from "../src/components/Navbar";

export const metadata: Metadata = {
  title: "Foodie",
  description: "Food ordering app rebuilt from scratch"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 container mx-auto px-4 py-6">
                {children}
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}