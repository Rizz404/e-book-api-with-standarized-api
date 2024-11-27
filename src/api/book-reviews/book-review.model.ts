import { pgTable, text, timestamp, uuid, smallint } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import UserModel from "../users/user.model";
import BookModel from "../books/book.model";

const BookReviewModel = pgTable("book_reviews", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserModel.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => BookModel.id)
    .notNull(),
  rating: smallint(),
  comment: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default BookReviewModel;
