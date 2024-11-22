import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const enumRole = pgEnum("user_role", ["USER", "ADMIN"]);

const UserTable = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    username: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 100 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    role: enumRole().notNull().default("USER"),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(
        "https://i.pinimg.com/474x/fe/64/11/fe64116a7f610dbee15e840629fc7e67.jpg"
      ),
    isVerified: boolean().default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex().on(table.username), uniqueIndex().on(table.email)]
);

export default UserTable;
