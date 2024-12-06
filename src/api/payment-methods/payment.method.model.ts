import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const PaymentMethodModel = pgTable("payment_methods", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 50 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 })
    .notNull()
    .default("0.00")
    .$type<number>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type InsertPaymentMethodDTO = InferInsertModel<
  typeof PaymentMethodModel
>;
export type SelectPaymentMethodDTO = InferSelectModel<
  typeof PaymentMethodModel
>;

export default PaymentMethodModel;
