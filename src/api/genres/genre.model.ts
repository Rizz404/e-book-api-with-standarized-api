import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
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
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex().on(table.name)],
);

export type InsertGenreDTO = InferSelectModel<typeof GenreModel>;
export type SelectGenreDTO = InferInsertModel<typeof GenreModel>;

export default GenreModel;
