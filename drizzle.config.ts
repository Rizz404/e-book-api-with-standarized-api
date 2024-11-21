import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: ["./src/model/user.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true, // * Nanti ada di console
  strict: true, // * Biar ada confirmation dulu
});
