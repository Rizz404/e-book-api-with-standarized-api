import { RequestHandler } from "express";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import parsePagination from "../../utils/parse-pagination";
import GenreModel, { InsertGenreDTO, SelectGenreDTO } from "./genre.model";
import {
  createGenreService,
  deleteGenreService,
  findGenreByColumnService,
  findGenreByIdService,
  findGenresByFiltersService,
  findGenresLikeColumnService,
  updateGenreService,
} from "./genre.services";

// *==========*==========*==========POST==========*==========*==========*
export const createGenre: RequestHandler = async (req, res) => {
  try {
    const genreData: Pick<InsertGenreDTO, "name" | "description"> = req.body;

    const genre = await findGenreByColumnService(genreData.name);

    if (genre) {
      return createErrorResponse(res, "Genre already exist", 400);
    }

    const newGenre = await createGenreService(genreData);

    createSuccessResponse(res, newGenre, "Genre created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getGenres: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectGenreDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { genres, totalItems } = await findGenresByFiltersService(
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(genres, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getGenresLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      name = "",
    } = req.query as unknown as Partial<SelectGenreDTO> & {
      page?: string;
      limit?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { genres, totalItems } = await findGenresLikeColumnService(
      limit,
      offset,
      GenreModel.name,
      name,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(genres, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getGenreById: RequestHandler = async (req, res) => {
  try {
    const { genreId } = req.params;

    const genre = await findGenreByIdService(genreId);

    if (!genre) {
      return createErrorResponse(res, "Genre not found", 404);
    }

    createSuccessResponse(res, genre);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateGenreById: RequestHandler = async (req, res) => {
  try {
    const { genreId } = req.params;
    const genreData: Partial<InsertGenreDTO> = req.body;

    const existingGenre = await findGenreByIdService(genreId);

    if (!existingGenre) {
      return createErrorResponse(res, "Genre not found", 404);
    }

    const updatedGenre = await updateGenreService(genreId, genreData);

    createSuccessResponse(res, updatedGenre);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteGenreById: RequestHandler = async (req, res) => {
  try {
    const { genreId } = req.params;
    const deletedGenre = await deleteGenreService(genreId);

    if (!deletedGenre) {
      return createErrorResponse(
        res,
        "Something cause genre not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted genre with id ${deletedGenre.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
