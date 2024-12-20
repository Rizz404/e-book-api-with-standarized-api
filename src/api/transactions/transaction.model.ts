import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import PaymentMethodModel from "../payment-methods/payment-method.model";
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
  paymentMethodId: uuid("payment_method_id")
    .references(() => PaymentMethodModel.id)
    .notNull(),
  adminFee: decimal("admin_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00")
    .$type<number>(),
  totalShippingServicesFee: decimal("total_shipping_services_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00")
    .$type<number>(),
  paymentMethodFee: decimal("payment_method_fee", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00")
    .$type<number>(),
  discount: decimal({ precision: 10, scale: 2 })
    .notNull()
    .default("0.00")
    .$type<number>(),
  subtotalPrice: decimal("subtotal_price", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00")
    .$type<number>(),
  totalPrice: decimal("total_price", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0.00")
    .$type<number>(),
  paymentReference: text("payment_reference"), // * Mungkin nanti tambahin providernya sebagai table
  status: enumPaymentStatus().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type InsertTransactionDTO = InferInsertModel<typeof TransactionModel>;
export type SelectTransactionDTO = InferSelectModel<typeof TransactionModel>;

export default TransactionModel;
