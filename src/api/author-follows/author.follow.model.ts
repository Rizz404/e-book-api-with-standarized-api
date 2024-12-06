import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import AuthorModel from "../authors/author.model";
import UserModel from "../users/user.model";

const AuthorFollowModel = pgTable(
  "author_follows",
  {
    followedUserId: uuid("followed_user_id")
      .references(() => UserModel.id)
      .notNull(),
    followingAuthorId: uuid("following_author_id")
      .references(() => AuthorModel.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followedUserId, table.followingAuthorId] }),
  ],
);

export type InsertAuthorFollowDTO = InferInsertModel<typeof AuthorFollowModel>;
export type SelectAuthorFollowDTO = InferSelectModel<typeof AuthorFollowModel>;

export default AuthorFollowModel;
