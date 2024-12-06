import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.STATUS === "development"
        ? (process.env.DATABASE_URL_LOCAL as string)
        : (process.env.DATABASE_URL as string),
  },
  verbose: true, // * Nanti ada di console
  strict: true, // * Biar ada confirmation dulu
});
