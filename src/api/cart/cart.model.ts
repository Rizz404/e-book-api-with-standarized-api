import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const CartModel = pgTable("carts", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserModel.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export default CartModel;
