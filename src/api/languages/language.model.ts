import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const LanguageModel = pgTable(
  "languages",
  {
    id: uuid().primaryKey().defaultRandom(),
    code: varchar({ length: 20 }).notNull(),
    name: varchar({ length: 100 }).notNull(),

    // * Denormalisasi
    userPreferedLanguageCount: integer("user_prefered_language_count")
      .notNull()
      .default(0),
    bookCount: integer("book_count").notNull().default(0),
  },
  (table) => [uniqueIndex().on(table.code), uniqueIndex().on(table.name)],
);

export type InsertLanguageDTO = InferInsertModel<typeof LanguageModel>;
export type SelectLanguageDTO = InferSelectModel<typeof LanguageModel>;

export default LanguageModel;
