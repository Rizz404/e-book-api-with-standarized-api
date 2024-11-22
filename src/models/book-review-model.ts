import { pgTable, text, timestamp, uuid, smallint } from "drizzle-orm/pg-core";
import UserTable from "./user-model";
import { sql } from "drizzle-orm";
import BookTable from "./book-model";

const BookReviewTable = pgTable("book_reviews", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserTable.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => BookTable.id)
    .notNull(),
  rating: smallint(),
  comment: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default BookReviewTable;
