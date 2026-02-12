import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "./db";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import addressRoutes from "./routes/addresses";
import restaurantRoutes from "./routes/restaurants";
import orderRoutes from "./routes/orders";

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET not set in .env");
}

// Configure session store to use Postgres
const PgSessionStore = pgSession(session);

app.use(
  cors({
    origin: "http://localhost:3000", // frontend origin
    credentials: true // allow cookies to be sent
  })
);

// Parses JSON request bodies
app.use(express.json());

// Session middleware
app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "session"
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true only in production with HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);

// Basic error handler (optional)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});