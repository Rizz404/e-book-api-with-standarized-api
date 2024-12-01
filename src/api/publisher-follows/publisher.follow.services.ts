import { and, between, count, desc, eq, SQL, sql } from "drizzle-orm";

import db from "../../config/database-config";
import PublisherModel from "../publishers/publisher.model";
import PublisherFollowModel, {
  InsertPublisherFollowDTO,
} from "./publisher.follow.model";

export const followPublisherService = async (
  publisherFollowData: InsertPublisherFollowDTO,
) => {
  return (
    await db
      .insert(PublisherFollowModel)
      .values(publisherFollowData)
      .returning()
  )[0];
};

export const findPublishersFollowedService = async (
  userId: string,
  limit: string,
  offset: number,
) => {
  const filtersQuery = and(
    eq(PublisherFollowModel.followedUserId, userId),
    eq(PublisherModel.id, PublisherFollowModel.followingPublisherId),
  );

  // * Query total item untuk pagination
  const totalItemsQuery = await db
    .select({ count: count() })
    .from(PublisherModel)
    .innerJoin(
      PublisherFollowModel,
      eq(PublisherModel.id, PublisherFollowModel.followingPublisherId),
    )
    .where(filtersQuery);

  const totalItems = totalItemsQuery[0]?.count || 0;

  // * Query data publishers
  const publishers = await db
    .select()
    .from(PublisherModel)
    .innerJoin(
      PublisherFollowModel,
      eq(PublisherModel.id, PublisherFollowModel.followingPublisherId),
    )
    .where(filtersQuery)
    .orderBy(desc(PublisherModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, publishers };
};

export const findFollowedPublisherService = async (
  publisherId: string,
  userId: string,
) => {
  return (
    await db
      .select()
      .from(PublisherFollowModel)
      .where(
        and(
          eq(PublisherFollowModel.followingPublisherId, publisherId),
          eq(PublisherFollowModel.followedUserId, userId),
        ),
      )
  )[0];
};

// * * Gak usah returning kali, soalnya kan delete
export const unfollowPublisherService = async (
  publisherId: string,
  userId: string,
) => {
  return await db
    .delete(PublisherFollowModel)
    .where(
      and(
        eq(PublisherFollowModel.followingPublisherId, publisherId),
        eq(PublisherFollowModel.followedUserId, userId),
      ),
    );
};
