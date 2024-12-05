import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const UserApiKeyModel = pgTable("user_api_keys", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => UserModel.id, {
    onDelete: "cascade",
  }),
  apiKey: text("api_key").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type InsertUserApiKeyDTO = InferSelectModel<typeof UserApiKeyModel>;
export type SelectUserApiKeyDTO = InferInsertModel<typeof UserApiKeyModel>;

export default UserApiKeyModel;
