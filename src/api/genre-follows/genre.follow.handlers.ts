import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api.request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api.response.utils";
import GenreFollowModel, {
  InsertGenreFollowDTO,
  SelectGenreFollowDTO,
} from "./genre.follow.model";
import {
  findFollowedGenreService,
  findGenresFollowedService,
  followGenreService,
  unfollowGenreService,
} from "./genre.follow.services";

// *==========*==========*==========POST==========*==========*==========*
export const followGenreByGenreId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { genreId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const alreadyFollowedGenre = await findFollowedGenreService(
      genreId,
      userId,
    );

    if (alreadyFollowedGenre) {
      return createErrorResponse(res, "Already follow this genre", 400);
    }

    const followedGenre = await followGenreService({
      followedUserId: userId,
      followingGenreId: genreId,
    });

    createSuccessResponse(
      res,
      followedGenre,
      `Successfully follow genre with id ${genreId}`,
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getGenresFollowed: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = "1", limit = "10" } = req.query as unknown as {
      page?: string;
      limit?: string;
    };

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { genres, totalItems } = await findGenresFollowedService(
      userId,
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

// *==========*==========*==========PATCH==========*==========*==========*

// *==========*==========*==========DELETE==========*==========*==========*
export const unFollowGenreByGenreId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { genreId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const followingGenre = await findFollowedGenreService(genreId, userId);

    if (!followingGenre) {
      return createErrorResponse(res, "Already unfollow this genre", 400);
    }

    await unfollowGenreService(genreId, userId);

    createSuccessResponse(
      res,
      undefined,
      `Successfully unfollow genre with id ${genreId}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
