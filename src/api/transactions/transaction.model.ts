import { sql } from "drizzle-orm";
import {
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

export const enumPaymentStatus = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

const TransactionModel = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserModel.id)
    .notNull(),
  adminFee: decimal("admin_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  totalShippingServicesFee: decimal("total_shipping_services_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  paymentMethodFee: decimal("payment_method_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  discount: decimal({ precision: 10, scale: 2 }).notNull().default("0.00"),
  subtotalPrice: decimal("subtotal_price", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  totalPrice: decimal("total_price", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00"),
  paymentReference: text("payment_reference"), // * Mungkin nanti tambahin providernya sebagai table
  status: enumPaymentStatus().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default TransactionModel;
