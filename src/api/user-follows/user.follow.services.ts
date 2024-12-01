import { and, between, count, desc, eq, SQL, sql } from "drizzle-orm";

import db from "../../config/database-config";
import UserModel from "../users/user.model";
import UserFollowModel, { InsertUserFollowDTO } from "./user.follow.model";

export const followUserService = async (
  userFollowData: InsertUserFollowDTO,
) => {
  return (
    await db.insert(UserFollowModel).values(userFollowData).returning()
  )[0];
};

export const findUsersFollowedService = async (
  userId: string,
  limit: string,
  offset: number,
  filters?: { role?: "ADMIN" | "USER"; isVerified?: boolean },
) => {
  let filtersQuery = and(
    eq(UserFollowModel.followedUserId, userId),
    eq(UserModel.id, UserFollowModel.followingUserId),
  );

  if (filters && filters.role) {
    filtersQuery = and(filtersQuery, eq(UserModel.role, filters.role));
  }

  if (filters && filters.isVerified) {
    filtersQuery = and(
      filtersQuery,
      eq(UserModel.isVerified, filters.isVerified),
    );
  }

  const totalItemsQuery = await db
    .select({ count: count() })
    .from(UserModel)
    .innerJoin(
      UserFollowModel,
      eq(UserModel.id, UserFollowModel.followingUserId),
    )
    .where(filtersQuery);

  const totalItems = totalItemsQuery[0]?.count || 0;

  const users = await db
    .select()
    .from(UserModel)
    .innerJoin(
      UserFollowModel,
      eq(UserModel.id, UserFollowModel.followingUserId),
    )
    .where(filtersQuery)
    .orderBy(desc(UserModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, users };
};

export const findFollowedUserService = async (
  userId: string,
  currentUserId: string,
) => {
  return (
    await db
      .select()
      .from(UserFollowModel)
      .where(
        and(
          eq(UserFollowModel.followingUserId, userId),
          eq(UserFollowModel.followedUserId, currentUserId),
        ),
      )
  )[0];
};

// * * Gak usah returning kali, soalnya kan delete
export const unfollowUserService = async (
  userId: string,
  currentUserId: string,
) => {
  return await db
    .delete(UserFollowModel)
    .where(
      and(
        eq(UserFollowModel.followingUserId, userId),
        eq(UserFollowModel.followedUserId, currentUserId),
      ),
    );
};
