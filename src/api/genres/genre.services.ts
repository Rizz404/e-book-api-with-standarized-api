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
import GenreModel, { InsertGenreDTO, SelectGenreDTO } from "./genre.model";

export const createGenreService = async (genreData: SelectGenreDTO) => {
  return (await db.insert(GenreModel).values(genreData).returning())[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findGenresByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (await db.select({ count: count() }).from(GenreModel).where(filters))[0]
      .count || 0;
  const genres = await db
    .select()
    .from(GenreModel)
    .where(filters)
    .orderBy(desc(GenreModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, genres };
};

export const findGenresLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(GenreModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const genres = await db
    .select()
    .from(GenreModel)
    .where(ilike(column, `%${value}%`))
    .orderBy(desc(GenreModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, genres };
};

export const findGenreByIdService = async (id: string) => {
  return (
    await db.select().from(GenreModel).where(eq(GenreModel.id, id)).limit(1)
  )[0];
};

export const findGenreByColumnService = async (name: string) => {
  return (
    await db
      .select()
      .from(GenreModel)
      .where(or(eq(GenreModel.name, name)))
      .limit(1)
  )[0];
};

export const updateGenreService = async (
  genreId: string,
  genreData: Partial<InsertGenreDTO>,
) => {
  const { name, description } = genreData;

  return (
    await db
      .update(GenreModel)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      })
      .where(eq(GenreModel.id, genreId))
      .returning()
  )[0];
};

export const deleteGenreService = async (genreId: string) => {
  return (
    await db.delete(GenreModel).where(eq(GenreModel.id, genreId)).returning()
  )[0];
};
