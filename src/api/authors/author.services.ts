import {
  Column,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
  SQLWrapper,
} from "drizzle-orm";

import db from "../../config/database-config";
import AuthorModel, { InsertAuthorDTO, SelectAuthorDTO } from "./author.model";

export const createAuthorService = async (authorData: InsertAuthorDTO) => {
  return (await db.insert(AuthorModel).values(authorData).returning())[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findAuthorsByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (await db.select({ count: count() }).from(AuthorModel).where(filters))[0]
      .count || 0;
  const authors = await db
    .select()
    .from(AuthorModel)
    .where(filters)
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
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(AuthorModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const authors = await db
    .select()
    .from(AuthorModel)
    .where(ilike(column, `%${value}%`))
    .orderBy(desc(AuthorModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, authors };
};

export const findAuthorByIdService = async (id: string) => {
  return (
    await db.select().from(AuthorModel).where(eq(AuthorModel.id, id)).limit(1)
  )[0];
};

export const findAuthorByColumnService = async (name: string) => {
  return (
    await db
      .select()
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
