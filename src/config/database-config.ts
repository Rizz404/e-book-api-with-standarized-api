import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema";

const db = drizzle<typeof schema>({
  connection: { connectionString: process.env.DATABASE_URL },
  logger: true,
  schema: schema,
});

export default db;
