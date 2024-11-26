import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import BookTable from "./book-model";

const BookPictureTable = pgTable(
  "book_pictures",
  {
    id: uuid().primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => BookTable.id)
      .notNull(),
    url: varchar({ length: 255 }).notNull(),
    isCover: boolean("is_cover").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex().on(table.bookId, table.isCover)],
);

export default BookPictureTable;
