import { sql } from "drizzle-orm";
import {
  date,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const AuthorTable = pgTable(
  "authors",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    biography: text(),
    birthDate: date("birth_date").notNull(),
    deathDate: date("death_date").notNull(),
    profilePicture: varchar("profile_picture", { length: 255 })
      .notNull()
      .default(
        "https://i.pinimg.com/236x/11/64/4b/11644bef2986a35c7b2e2f3886cddb3f.jpg",
      ),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex().on(table.name)],
);

export default AuthorTable;
