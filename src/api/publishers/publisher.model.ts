import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const PublisherModel = pgTable(
  "publishers",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    description: text(),
    website: text().array(),
    picture: varchar("picture", { length: 255 })
      .notNull()
      .default(
        "https://i.pinimg.com/236x/11/3f/0f/113f0fff79469d6e6c14baa01dc5a177.jpg",
      ),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),

    // * Denormalisasi
    followerCount: integer("follower_count").notNull().default(0),
  },
  (table) => [uniqueIndex().on(table.name), uniqueIndex().on(table.email)],
);

export type InsertPublisherDTO = InferInsertModel<typeof PublisherModel>;
export type SelectPublisherDTO = InferSelectModel<typeof PublisherModel>;

export default PublisherModel;
