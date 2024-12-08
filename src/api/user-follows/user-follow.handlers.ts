import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import UserFollowModel, {
  InsertUserFollowDTO,
  SelectUserFollowDTO,
} from "./user-follow.model";
import {
  findFollowedUserService,
  findUsersFollowedService,
  followUserService,
  unfollowUserService,
} from "./user-follow.services";

// *==========*==========*==========POST==========*==========*==========*
export const followUserByUserId: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;

    if (!currentUserId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const alreadyFollowedUser = await findFollowedUserService(
      userId,
      currentUserId,
    );

    if (alreadyFollowedUser) {
      return createErrorResponse(res, "Already follow this user", 400);
    }

    const followedUser = await followUserService({
      followedUserId: userId,
      followingUserId: userId,
    });

    createSuccessResponse(
      res,
      followedUser,
      `Successfully follow user with id ${userId}`,
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getUsersFollowed: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const {
      page = "1",
      limit = "10",
      role,
      isVerified,
    } = req.query as unknown as {
      page?: string;
      limit?: string;
      role?: "ADMIN" | "USER";
      isVerified?: boolean;
    };

    if (!currentUserId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { users, totalItems } = await findUsersFollowedService(
      currentUserId,
      limit,
      offset,
      { role, isVerified },
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(users, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*

// *==========*==========*==========DELETE==========*==========*==========*
export const unFollowUserByUserId: RequestHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;

    if (!currentUserId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const followingUser = await findFollowedUserService(userId, currentUserId);

    if (!followingUser) {
      return createErrorResponse(res, "Already unfollow this user", 400);
    }

    await unfollowUserService(userId, userId);

    createSuccessResponse(
      res,
      undefined,
      `Successfully unfollow user with id ${userId}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
