import { and, between, count, desc, eq, SQL, sql } from "drizzle-orm";

import db from "../../config/database.config";
import AuthorModel from "../authors/author.model";
import { authorResponse } from "../authors/author.services";
import AuthorFollowModel, {
  InsertAuthorFollowDTO,
} from "./author-follow.model";

interface IFilters {
  deathDateRange?: { start: string; end: string }; // * Range deathDate
  birthDateRange?: { start: string; end: string }; // * Range birthDate
}

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
  filters?: IFilters,
) => {
  const conditions: SQL<unknown>[] = [];

  conditions.push(eq(AuthorFollowModel.followedUserId, userId));
  conditions.push(eq(AuthorModel.id, AuthorFollowModel.followingAuthorId));

  if (filters?.birthDateRange) {
    conditions.push(
      sql`${AuthorModel.birthDate} >= ${filters.birthDateRange.start}`,
      sql`${AuthorModel.birthDate} <= ${filters.birthDateRange.end}`,
    );
  }

  if (filters?.deathDateRange) {
    conditions.push(
      sql`${AuthorModel.deathDate} >= ${filters.deathDateRange.start}`,
      sql`${AuthorModel.deathDate} <= ${filters.deathDateRange.end}`,
    );
  }

  const filtersQuery = conditions.length > 0 ? and(...conditions) : undefined;

  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(AuthorModel)
        .innerJoin(
          AuthorFollowModel,
          eq(AuthorModel.id, AuthorFollowModel.followingAuthorId),
        )
        .where(filtersQuery)
    )[0].count || 0;

  const authors = await db
    .select(authorResponse)
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
