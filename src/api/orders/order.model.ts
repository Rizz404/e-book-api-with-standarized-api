import { sql } from "drizzle-orm";
import { decimal, integer, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

import BookModel from "../books/book.model";
import ShippingServiceModel from "../shipping-services/shipping.service.model";
import TransactionModel from "../transactions/transaction.model";
import UserModel from "../users/user.model";

export const enumShippingStatus = pgEnum("shipping_status", [
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

const OrderModel = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserModel.id)
    .notNull(),
  bookId: uuid("book_id")
    .references(() => BookModel.id)
    .notNull(),
  shippingServiceId: uuid("shipping_service_id")
    .references(() => ShippingServiceModel.id)
    .notNull(),
  transactionId: uuid("transaction_id")
    .references(() => TransactionModel.id)
    .notNull(),
  quantity: integer().notNull().default(0),
  priceSold: decimal("price_sold", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  shippingStatus: enumShippingStatus() // Status pengiriman (Pending, Shipped, Delivered)
    .notNull()
    .default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default OrderModel;
