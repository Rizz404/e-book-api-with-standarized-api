import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const UserAddressModel = pgTable("user_addresses", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => UserModel.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  detailAddress: text("detail_address").notNull(),
  coordinate: text(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type InsertUserAddressDTO = InferSelectModel<typeof UserAddressModel>;
export type SelectUserAddressDTO = InferInsertModel<typeof UserAddressModel>;

export default UserAddressModel;
