import { sql } from "drizzle-orm";
import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";

type EnumRole = ["USER", "ADMIN"];
export const enumRole: EnumRole = ["USER", "ADMIN"];

// * Default namanya sama kaya keynya jadi untuk yang lebih dari satu kata buat pake snake case
const userTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  username: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 100 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  role: varchar({ enum: enumRole }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default userTable;
