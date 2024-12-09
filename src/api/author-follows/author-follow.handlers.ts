import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import AuthorFollowModel, {
  InsertAuthorFollowDTO,
  SelectAuthorFollowDTO,
} from "./author-follow.model";
import {
  findAuthorsFollowedService,
  findFollowedAuthorService,
  followAuthorService,
  unfollowAuthorService,
} from "./author-follow.services";

// *==========*==========*==========POST==========*==========*==========*
export const followAuthorByAuthorId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { authorId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const alreadyFollowedAuthor = await findFollowedAuthorService(
      authorId,
      userId,
    );

    if (alreadyFollowedAuthor) {
      return createErrorResponse(res, "Already follow this author", 400);
    }

    const followedAuthor = await followAuthorService({
      followedUserId: userId,
      followingAuthorId: authorId,
    });

    createSuccessResponse(
      res,
      followedAuthor,
      `Successfully follow author with id ${authorId}`,
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getAuthorsFollowed: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      page = "1",
      limit = "10",
      birthDateRange,
      deathDateRange,
    } = req.query as unknown as {
      page?: string;
      limit?: string;
      birthDateRange?: string;
      deathDateRange?: string;
    };

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    // * Literally menggunakan anonymous function
    const parsedFilters = {
      birthDateRange: birthDateRange
        ? (() => {
            const [start, end] = birthDateRange.split(",");
            return { start, end };
          })()
        : undefined,
      deathDateRange: deathDateRange
        ? (() => {
            const [start, end] = deathDateRange.split(",");
            return { start, end };
          })()
        : undefined,
    };

    const { authors, totalItems } = await findAuthorsFollowedService(
      userId,
      limit,
      offset,
      parsedFilters,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(authors, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getAuthorFollowByAuthorId: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const { authorId } = req.params;

    const authorFollow = await findFollowedAuthorService(authorId, userId);

    if (!authorFollow) {
      return createErrorResponse(res, "Not follow this author", 404);
    }

    createSuccessResponse(res, authorFollow);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*

// *==========*==========*==========DELETE==========*==========*==========*
export const unFollowAuthorByAuthorId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { authorId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const followingAuthor = await findFollowedAuthorService(authorId, userId);

    if (!followingAuthor) {
      return createErrorResponse(res, "Already unfollow this author", 400);
    }

    await unfollowAuthorService(authorId, userId);

    createSuccessResponse(
      res,
      undefined,
      `Successfully unfollow author with id ${authorId}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
