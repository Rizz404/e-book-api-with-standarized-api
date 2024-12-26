import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import BookModel from "../books/book.model";
import UserModel from "../users/user.model";

const BookWishlistModel = pgTable(
  "book_wishlist",
  {
    userId: uuid("user_id")
      .references(() => UserModel.id)
      .notNull(),
    bookId: uuid("book_id")
      .references(() => BookModel.id)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.bookId],
    }),
  ],
);

export type InsertBookWishlistDTO = InferInsertModel<typeof BookWishlistModel>;
export type SelectBookWishlistDTO = InferSelectModel<typeof BookWishlistModel>;

export default BookWishlistModel;
