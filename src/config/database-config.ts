import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maksimal 20 koneksi bersamaan
  idleTimeoutMillis: 30000, // Waktu maksimal koneksi idle sebelum ditutup
  connectionTimeoutMillis: 2000, // Timeout jika koneksi baru gagal dibuat
});

const db = drizzle<typeof schema>({
  client: pool,
  logger: true,
  schema: schema,
});

pool.on("connect", () => console.log("Koneksi baru ke database dibuat!"));
pool.on("remove", () => console.log("Koneksi dihapus dari pool."));
pool.on("error", (err) => console.error("Error di pool:", err));

export default db;
