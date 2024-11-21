import { drizzle } from "drizzle-orm/node-postgres";

export default drizzle({
  connection: { connectionString: process.env.DATABASE_URL },
  logger: true,
});
