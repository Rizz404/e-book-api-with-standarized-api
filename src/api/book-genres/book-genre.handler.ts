import { RequestHandler } from "express";

import {
  createErrorResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { InsertBookGenreDTO } from "./book-genre.model";
import {
  createBookGenresService,
  deleteBookGenreService,
  getBookGenresService,
} from "./book-genre.services";

export const createBookGenres: RequestHandler = async (req, res) => {
  try {
    const genres: InsertBookGenreDTO[] = req.body;
    const createdGenres = await createBookGenresService(genres);

    createSuccessResponse(res, createdGenres, "Book genre added", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getBookGenres: RequestHandler = async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookGenres = await getBookGenresService(bookId);

    if (!bookGenres || bookGenres.length <= 0) {
      return createErrorResponse(
        res,
        "No book genre found, you should add one at least",
        404,
      );
    }

    createSuccessResponse(res, bookGenres);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const deleteBookGenre: RequestHandler = async (req, res) => {
  try {
    const { bookId, genreId } = req.params;

    const bookGenres = await getBookGenresService(bookId);

    if (bookGenres.length === 1) {
      return createErrorResponse(
        res,
        "You can't delete all book genres, must be one exist",
        400,
      );
    }

    const deletedBookGenre = await deleteBookGenreService(bookId, genreId);

    if (!deletedBookGenre) {
      return createErrorResponse(res, "Something went wrong", 400);
    }

    createSuccessResponse(res, deletedBookGenre);
  } catch (error) {
    createErrorResponse(res, error);
  }
};
