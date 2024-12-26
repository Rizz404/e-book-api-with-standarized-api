import {
  and,
  Column,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
  sql,
  SQLWrapper,
} from "drizzle-orm";
import { string } from "joi";

import db from "../../config/database.config";
import AuthorModel, { InsertAuthorDTO, SelectAuthorDTO } from "./author.model";

interface IFilters {
  deathDateRange?: { start: string; end: string }; // * Range deathDate
  birthDateRange?: { start: string; end: string }; // * Range birthDate
}

export const authorResponse = {
  id: AuthorModel.id,
  name: AuthorModel.name,
  biography: AuthorModel.biography,
  birthDate: AuthorModel.birthDate,
  deathDate: AuthorModel.deathDate,
  profilePicture: AuthorModel.profilePicture,
  createdAt: AuthorModel.createdAt,
  updatedAt: AuthorModel.updatedAt,

  followerCount: AuthorModel.followerCount,
};

export const createAuthorService = async (authorData: InsertAuthorDTO) => {
  return (await db.insert(AuthorModel).values(authorData).returning())[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findAuthorsByFiltersService = async (
  limit: string,
  offset: number,
  filters?: IFilters,
  userId?: string,
) => {
  const conditions: SQL<unknown>[] = [];

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
      await db.select({ count: count() }).from(AuthorModel).where(filtersQuery)
    )[0].count || 0;
  const authors = await db
    .select({ ...authorResponse, ...getIsFollowedAuthor(userId) })
    .from(AuthorModel)
    .where(filtersQuery)
    .orderBy(desc(AuthorModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, authors };
};

export const findAuthorsLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
  userId?: string,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(AuthorModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const authors = await db
    .select({ ...authorResponse, ...getIsFollowedAuthor(userId) })
    .from(AuthorModel)
    .where(ilike(column, `%${value}%`))
    .orderBy(desc(AuthorModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, authors };
};

export const findAuthorByIdService = async (id: string, userId?: string) => {
  return (
    await db
      .select({ ...authorResponse, ...getIsFollowedAuthor(userId) })
      .from(AuthorModel)
      .where(eq(AuthorModel.id, id))
      .limit(1)
  )[0];
};

export const findAuthorByColumnService = async (
  name: string,
  userId?: string,
) => {
  return (
    await db
      .select({ ...authorResponse, ...getIsFollowedAuthor(userId) })
      .from(AuthorModel)
      .where(or(eq(AuthorModel.name, name)))
      .limit(1)
  )[0];
};

export const updateAuthorService = async (
  authorId: string,
  authorData: Partial<InsertAuthorDTO>,
) => {
  const { name, biography, profilePicture, birthDate, deathDate } = authorData;

  return (
    await db
      .update(AuthorModel)
      .set({
        ...(name !== undefined && { name }),
        ...(biography !== undefined && { biography }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(birthDate !== undefined && { birthDate }),
        ...(deathDate !== undefined && { deathDate }),
      })
      .where(eq(AuthorModel.id, authorId))
      .returning()
  )[0];
};

export const deleteAuthorService = async (authorId: string) => {
  return (
    await db.delete(AuthorModel).where(eq(AuthorModel.id, authorId)).returning()
  )[0];
};

export const getIsFollowedAuthor = (userId?: string) => {
  return {
    isFollowedAuthor: userId
      ? sql`
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM author_follows
            WHERE author_follows.followed_user_id = ${AuthorModel.id}
              AND author_follows.following_author_id = ${userId}
          ) THEN true
          ELSE false
        END
      `.as("isFollowedAuthor")
      : sql`false`.as("isFollowedAuthor"), // * Jika userId tidak ada, langsung false
  };
};
