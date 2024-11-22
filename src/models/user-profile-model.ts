import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import UserTable from "./user-model";

const UserProfileTable = pgTable("user_profiles", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserTable.id)
    .notNull(),
  bio: text(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default UserProfileTable;
