import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, primaryKey, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import PublisherModel from "../publishers/publisher.model";
import UserModel from "../users/user.model";

const PublisherFollowModel = pgTable(
  "publisher_follows",
  {
    followedUserId: uuid("followed_user_id")
      .references(() => UserModel.id)
      .notNull(),
    followingPublisherId: uuid("following_publisher_id")
      .references(() => PublisherModel.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followedUserId, table.followingPublisherId] }),
  ],
);

export type InsertPublisherFollowDTO = InferInsertModel<
  typeof PublisherFollowModel
>;
export type SelectPublisherFollowDTO = InferSelectModel<
  typeof PublisherFollowModel
>;

export default PublisherFollowModel;
