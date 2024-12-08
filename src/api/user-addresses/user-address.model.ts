import { eq, InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const UserAddressModel = pgTable(
  "user_addresses",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => UserModel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    detailAddress: text("detail_address").notNull(),
    isPrimaryAddress: boolean("is_primary_address").notNull().default(false),
    coordinate: text(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex()
      .on(table.userId, table.isPrimaryAddress)
      .where(eq(table.isPrimaryAddress, sql`true`)),
  ],
);

export type InsertUserAddressDTO = InferSelectModel<typeof UserAddressModel>;
export type SelectUserAddressDTO = InferInsertModel<typeof UserAddressModel>;

export default UserAddressModel;
