import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api.request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api.response.utils";
import PublisherFollowModel, {
  InsertPublisherFollowDTO,
  SelectPublisherFollowDTO,
} from "./publisher.follow.model";
import {
  findFollowedPublisherService,
  findPublishersFollowedService,
  followPublisherService,
  unfollowPublisherService,
} from "./publisher.follow.services";

// *==========*==========*==========POST==========*==========*==========*
export const followPublisherByPublisherId: RequestHandler = async (
  req,
  res,
) => {
  try {
    const userId = req.user?.id;
    const { publisherId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const alreadyFollowedPublisher = await findFollowedPublisherService(
      publisherId,
      userId,
    );

    if (alreadyFollowedPublisher) {
      return createErrorResponse(res, "Already follow this publisher", 400);
    }

    const followedPublisher = await followPublisherService({
      followedUserId: userId,
      followingPublisherId: publisherId,
    });

    createSuccessResponse(
      res,
      followedPublisher,
      `Successfully follow publisher with id ${publisherId}`,
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getPublishersFollowed: RequestHandler = async (req, res) => {
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

    const { publishers, totalItems } = await findPublishersFollowedService(
      userId,
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        publishers,
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
export const unFollowPublisherByPublisherId: RequestHandler = async (
  req,
  res,
) => {
  try {
    const userId = req.user?.id;
    const { publisherId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const followingPublisher = await findFollowedPublisherService(
      publisherId,
      userId,
    );

    if (!followingPublisher) {
      return createErrorResponse(res, "Already unfollow this publisher", 400);
    }

    await unfollowPublisherService(publisherId, userId);

    createSuccessResponse(
      res,
      undefined,
      `Successfully unfollow publisher with id ${publisherId}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
