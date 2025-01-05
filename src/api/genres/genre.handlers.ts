import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import {
  deleteCloudinaryImage,
  isCloudinaryUrl,
  isValidUrl,
} from "../../utils/cloudinary-utils";
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
    const genreData: Pick<InsertGenreDTO, "name" | "description" | "picture"> =
      req.body;

    const pictureAsFile = req.file;

    // * Cek apakah penulis dengan nama yang sama sudah ada
    const existingGenre = await findGenreByColumnService(genreData.name);
    if (existingGenre) {
      return createErrorResponse(res, "Genre already exists", 400);
    }

    // * Periksa apakah picture diberikan sebagai file atau string
    const picture = pictureAsFile?.cloudinary?.secure_url || genreData.picture;

    if (pictureAsFile && genreData.picture) {
      return createErrorResponse(
        res,
        "You cannot provide both file and picture URL",
        400,
      );
    }

    const newGenre = await createGenreService({ ...genreData, picture });

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
    const { name, description, picture }: Partial<InsertGenreDTO> = req.body;

    const existingGenre = await findGenreByIdService(genreId);

    if (!existingGenre) {
      return createErrorResponse(res, "Genre not found", 404);
    }

    // * Handle picture update
    let pictureUrl = existingGenre.picture;

    // * Jika ada file upload baru
    if (req.file?.cloudinary) {
      // * Hapus image lama dari Cloudinary jika itu adalah Cloudinary image
      if (existingGenre.picture && isCloudinaryUrl(existingGenre.picture)) {
        console.log("Deleting old profile picture:", existingGenre.picture);
        await deleteCloudinaryImage(existingGenre.picture);
      }
      pictureUrl = req.file.cloudinary.secure_url;
    }
    // * Jika ada URL string baru yang valid
    else if (picture && isValidUrl(picture)) {
      if (
        existingGenre.picture &&
        isCloudinaryUrl(existingGenre.picture) &&
        !isCloudinaryUrl(picture)
      ) {
        console.log("Deleting old profile picture:", existingGenre.picture);
        await deleteCloudinaryImage(existingGenre.picture);
      }
      pictureUrl = picture;
    }

    const updatedGenre = await updateGenreService(genreId, {
      name,
      description,
      picture: pictureUrl,
    });

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
