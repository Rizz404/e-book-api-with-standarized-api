import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const ShippingServiceModel = pgTable("shipping_services", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 50 }).notNull(),
  description: text(),
  price: decimal({ precision: 10, scale: 2 }).notNull().default("0.00"),
  estimationTime: varchar("estimation_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type InsertShippingServiceDTO = InferInsertModel<
  typeof ShippingServiceModel
>;
export type SelectShippingServiceDTO = InferSelectModel<
  typeof ShippingServiceModel
>;

export default ShippingServiceModel;
