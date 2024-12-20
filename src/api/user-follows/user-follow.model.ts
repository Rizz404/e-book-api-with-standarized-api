import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import UserModel from "../users/user.model";

const UserFollowModel = pgTable(
  "user_follows",
  {
    followedUserId: uuid("followed_user_id")
      .references(() => UserModel.id)
      .notNull(),
    followingUserId: uuid("following_user_id")
      .references(() => UserModel.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followedUserId, table.followingUserId] }),
  ],
);

export type InsertUserFollowDTO = InferInsertModel<typeof UserFollowModel>;
export type SelectUserFollowDTO = InferSelectModel<typeof UserFollowModel>;

export default UserFollowModel;
