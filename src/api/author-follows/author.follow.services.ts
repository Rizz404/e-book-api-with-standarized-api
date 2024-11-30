import { and, between, count, desc, eq, SQL, sql } from "drizzle-orm";

import db from "../../config/database-config";
import AuthorModel from "../authors/author.model";
import AuthorFollowModel, {
  InsertAuthorFollowDTO,
} from "./author.follow.model";

export const followAuthorService = async (
  authorFollowData: InsertAuthorFollowDTO,
) => {
  return (
    await db.insert(AuthorFollowModel).values(authorFollowData).returning()
  )[0];
};

export const findAuthorsFollowedService = async (
  userId: string,
  limit: string,
  offset: number,
  filters?: {
    deathDateRange?: { start: string; end: string }; // * Range deathDate
    birthDateRange?: { start: string; end: string }; // * Range birthDate
  },
) => {
  let filtersQuery = and(
    eq(AuthorFollowModel.followedUserId, userId),
    eq(AuthorModel.id, AuthorFollowModel.followingAuthorId),
  );

  // * Tambahkan filter birthDate jika ada
  if (filters && filters.birthDateRange) {
    filtersQuery = and(
      filtersQuery,
      sql`${AuthorModel.birthDate} >= ${filters.birthDateRange.start}`,
      sql`${AuthorModel.birthDate} <= ${filters.birthDateRange.end}`,
    );
  }

  // * Tambahkan filter deathDate jika ada
  if (filters && filters.deathDateRange) {
    filtersQuery = and(
      filtersQuery,
      sql`${AuthorModel.deathDate} >= ${filters.deathDateRange.start}`,
      sql`${AuthorModel.deathDate} <= ${filters.deathDateRange.end}`,
    );
  }

  // * Query total item untuk pagination
  const totalItemsQuery = await db
    .select({ count: count() })
    .from(AuthorModel)
    .innerJoin(
      AuthorFollowModel,
      eq(AuthorModel.id, AuthorFollowModel.followingAuthorId),
    )
    .where(filtersQuery);

  const totalItems = totalItemsQuery[0]?.count || 0;

  // * Query data authors
  const authors = await db
    .select()
    .from(AuthorModel)
    .innerJoin(
      AuthorFollowModel,
      eq(AuthorModel.id, AuthorFollowModel.followingAuthorId),
    )
    .where(filtersQuery)
    .orderBy(desc(AuthorModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, authors };
};

export const findFollowedAuthorService = async (
  authorId: string,
  userId: string,
) => {
  return (
    await db
      .select()
      .from(AuthorFollowModel)
      .where(
        and(
          eq(AuthorFollowModel.followingAuthorId, authorId),
          eq(AuthorFollowModel.followedUserId, userId),
        ),
      )
  )[0];
};

// * * Gak usah returning kali, soalnya kan delete
export const unfollowAuthorService = async (
  authorId: string,
  userId: string,
) => {
  return await db
    .delete(AuthorFollowModel)
    .where(
      and(
        eq(AuthorFollowModel.followingAuthorId, authorId),
        eq(AuthorFollowModel.followedUserId, userId),
      ),
    );
};
