import db from "../../config/database.config";
import BookGenreModel, { InsertBookGenreDTO } from "./book-genre.model";

export const createBookGenresService = async (
  bookGenreData: InsertBookGenreDTO[],
) => {
  return await db.insert(BookGenreModel).values(bookGenreData);
};
