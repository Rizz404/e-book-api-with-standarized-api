import { sql } from "drizzle-orm";
import { integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

import BookModel from "../books/book.model";
import CartModel from "../cart/cart.model";

const CartItemModel = pgTable("cart_items", {
  id: uuid().primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .references(() => CartModel.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => BookModel.id)
    .notNull(),
  quantity: integer().notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default CartItemModel;
