import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  decimal,
  integer,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

import BookModel from "../books/book.model";
import CartModel from "../cart/cart.model";

const CartItemModel = pgTable(
  "cart_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .references(() => CartModel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    bookId: uuid("book_id")
      .references(() => BookModel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    quantity: integer().notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex().on(table.cartId, table.bookId)],
);

export type InsertCartItemDTO = InferInsertModel<typeof CartItemModel>;
export type SelectCartItemDTO = InferSelectModel<typeof CartItemModel>;

export default CartItemModel;
