import { and, between, count, desc, eq, SQL, sql } from "drizzle-orm";

import db from "../../config/database-config";
import GenreModel from "../genres/genre.model";
import GenreFollowModel, { InsertGenreFollowDTO } from "./genre.follow.model";

export const followGenreService = async (
  genreFollowData: InsertGenreFollowDTO,
) => {
  return (
    await db.insert(GenreFollowModel).values(genreFollowData).returning()
  )[0];
};

export const findGenresFollowedService = async (
  userId: string,
  limit: string,
  offset: number,
) => {
  const filtersQuery = and(
    eq(GenreFollowModel.followedUserId, userId),
    eq(GenreModel.id, GenreFollowModel.followingGenreId),
  );

  // * Query total item untuk pagination
  const totalItemsQuery = await db
    .select({ count: count() })
    .from(GenreModel)
    .innerJoin(
      GenreFollowModel,
      eq(GenreModel.id, GenreFollowModel.followingGenreId),
    )
    .where(filtersQuery);

  const totalItems = totalItemsQuery[0]?.count || 0;

  // * Query data genres
  const genres = await db
    .select()
    .from(GenreModel)
    .innerJoin(
      GenreFollowModel,
      eq(GenreModel.id, GenreFollowModel.followingGenreId),
    )
    .where(filtersQuery)
    .orderBy(desc(GenreModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, genres };
};

export const findFollowedGenreService = async (
  genreId: string,
  userId: string,
) => {
  return (
    await db
      .select()
      .from(GenreFollowModel)
      .where(
        and(
          eq(GenreFollowModel.followingGenreId, genreId),
          eq(GenreFollowModel.followedUserId, userId),
        ),
      )
  )[0];
};

// * * Gak usah returning kali, soalnya kan delete
export const unfollowGenreService = async (genreId: string, userId: string) => {
  return await db
    .delete(GenreFollowModel)
    .where(
      and(
        eq(GenreFollowModel.followingGenreId, genreId),
        eq(GenreFollowModel.followedUserId, userId),
      ),
    );
};
