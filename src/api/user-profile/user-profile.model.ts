import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";
import { smallint } from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const UserProfileModel = pgTable(
  "user_profiles",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => UserModel.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    bio: text(),
    age: smallint(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex().on(table.userId)],
);

export type InsertUserProfileDTO = InferSelectModel<typeof UserProfileModel>;
export type SelectUserProfileDTO = InferInsertModel<typeof UserProfileModel>;

export default UserProfileModel;
