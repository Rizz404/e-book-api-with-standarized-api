import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const GenreModel = pgTable(
  "genres",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    picture: varchar("picture", { length: 255 })
      .notNull()
      .default(
        "https://i.pinimg.com/originals/ca/6c/74/ca6c744333366d89b3824449cb844c2e.gif",
      ),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),

    // * Denormalisasi
    followerCount: integer("follower_count").notNull().default(0),
  },
  (table) => [uniqueIndex().on(table.name)],
);

export type InsertGenreDTO = InferSelectModel<typeof GenreModel>;
export type SelectGenreDTO = InferInsertModel<typeof GenreModel>;

export default GenreModel;
