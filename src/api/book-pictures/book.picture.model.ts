import { eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import BookModel from "../books/book.model";

const BookPictureModel = pgTable(
  "book_pictures",
  {
    id: uuid().primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => BookModel.id)
      .notNull(),
    url: varchar({ length: 255 }).notNull(),
    isCover: boolean("is_cover").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueCover: uniqueIndex("unique_index_book_cover")
      .on(table.bookId, table.isCover)
      .where(eq(table.isCover, sql`true`)),
  }),
);

export type InsertBookPictureDTO = InferSelectModel<typeof BookPictureModel>;
export type SelectBookPictureDTO = InferInsertModel<typeof BookPictureModel>;

export default BookPictureModel;
