import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import {
  addUserPreferedLanguageService,
  findFollowedUserPreferedLanguageService,
  findUserPreferedLanguagesFollowedService,
  removeUserPreferedLanguageService,
} from "./user-prefered-language.services";

// *==========*==========*==========POST==========*==========*==========*
export const addUserPreferedLanguageByLanguageId: RequestHandler = async (
  req,
  res,
) => {
  try {
    const userId = req.user?.id;
    const { languageId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const alreadyAddedLanguage = await findFollowedUserPreferedLanguageService(
      languageId,
      userId,
    );

    if (alreadyAddedLanguage) {
      return createErrorResponse(
        res,
        "Already follow this userPreferedLanguage",
        400,
      );
    }

    const followedUserPreferedLanguage = await addUserPreferedLanguageService({
      followedUserId: userId,
      followingLanguageId: languageId,
    });

    createSuccessResponse(
      res,
      followedUserPreferedLanguage,
      `Successfully follow userPreferedLanguage with id ${languageId}`,
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getUserPreferedLanguagesFollowed: RequestHandler = async (
  req,
  res,
) => {
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

    const { userPreferedLanguages, totalItems } =
      await findUserPreferedLanguagesFollowedService(userId, limit, offset);

    createSuccessResponse(
      res,
      createPaginatedResponse(
        userPreferedLanguages,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*

// *==========*==========*==========DELETE==========*==========*==========*
export const removeUserPreferedLanguageByLanguageId: RequestHandler = async (
  req,
  res,
) => {
  try {
    const userId = req.user?.id;
    const { languageId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const followingUserPreferedLanguage =
      await findFollowedUserPreferedLanguageService(languageId, userId);

    if (!followingUserPreferedLanguage) {
      return createErrorResponse(
        res,
        "Already unfollow this userPreferedLanguage",
        400,
      );
    }

    await removeUserPreferedLanguageService(languageId, userId);

    createSuccessResponse(
      res,
      undefined,
      `Successfully unfollow userPreferedLanguage with id ${languageId}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
