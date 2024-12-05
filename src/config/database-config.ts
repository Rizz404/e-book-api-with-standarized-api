import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../drizzle/schema";
import logger from "../utils/logger.util";

export const pool = new Pool({
  connectionString:
    process.env.STATUS === "development"
      ? process.env.DATABASE_URL_LOCAL
      : process.env.DATABASE_URL,
  max: 20, // Maksimal 20 koneksi bersamaan
  min: 2, // Pertahankan minimal 2 koneksi
  idleTimeoutMillis: 60000, // Naikkan timeout idle menjadi 1 menit
  connectionTimeoutMillis: 10000, // Naikkan timeout koneksi
  log: (msg) => logger.debug(msg), // Logging untuk pool
});

const db = drizzle<typeof schema>({
  client: pool,
  logger: true,
  schema: schema,
});

export default db;
