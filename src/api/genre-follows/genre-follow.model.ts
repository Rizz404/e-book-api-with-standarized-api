import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import GenreModel from "../genres/genre.model";
import UserModel from "../users/user.model";

const GenreFollowModel = pgTable(
  "genre_follows",
  {
    followedUserId: uuid("followed_user_id")
      .references(() => UserModel.id)
      .notNull(),
    followingGenreId: uuid("following_genre_id")
      .references(() => GenreModel.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followedUserId, table.followingGenreId] }),
  ],
);

export type InsertGenreFollowDTO = InferInsertModel<typeof GenreFollowModel>;
export type SelectGenreFollowDTO = InferSelectModel<typeof GenreFollowModel>;

export default GenreFollowModel;
