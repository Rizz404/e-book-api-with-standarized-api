import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import LanguageModel from "../languages/language.model";
import UserModel from "../users/user.model";

const UserPreferedLanguageModel = pgTable(
  "user_prefered_languages",
  {
    followedUserId: uuid("followed_user_id")
      .references(() => UserModel.id)
      .notNull(),
    followingLanguageId: uuid("following_language_id")
      .references(() => LanguageModel.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followedUserId, table.followingLanguageId] }),
  ],
);

export type InsertUserPreferedLanguageDTO = InferInsertModel<
  typeof UserPreferedLanguageModel
>;
export type SelectUserPreferedLanguageDTO = InferSelectModel<
  typeof UserPreferedLanguageModel
>;

export default UserPreferedLanguageModel;
