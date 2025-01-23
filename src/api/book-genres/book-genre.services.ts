import { and, eq } from "drizzle-orm";

import db from "../../config/database.config";
import GenreModel from "../genres/genre.model";
import BookGenreModel, { InsertBookGenreDTO } from "./book-genre.model";

export const bookGenreResponse = {
  bookId: BookGenreModel.bookId,
  genreId: BookGenreModel.genreId,
  genre: {
    name: GenreModel.name,
    description: GenreModel.description,
  },
};

export const createBookGenresService = async (
  bookGenreData: InsertBookGenreDTO[],
) => {
  return await db.insert(BookGenreModel).values(bookGenreData);
};

export const getBookGenresService = async (bookId: string) => {
  return await db
    .select(bookGenreResponse)
    .from(BookGenreModel)
    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
    .where(eq(BookGenreModel.bookId, bookId));
};

export const deleteBookGenreService = async (
  bookId: string,
  genreId: string,
) => {
  return await db
    .delete(BookGenreModel)
    .where(
      and(
        eq(BookGenreModel.bookId, bookId),
        eq(BookGenreModel.genreId, genreId),
      ),
    );
};
