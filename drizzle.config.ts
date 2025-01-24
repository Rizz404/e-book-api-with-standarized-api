import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: process.env.STATUS === "development" ? true : false, // * Nanti ada di console
  strict: true, // * Biar ada confirmation dulu
});
