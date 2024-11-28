import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import parsePagination from "../../utils/parse-pagination";
import { addFilters } from "../../utils/query-utils";
import UserModel, { InsertUserDTO, SelectUserDTO } from "./user.model";
import {
  createUserService,
  deleteUserService,
  findUserByColumnService,
  findUserByIdService,
  findUsersByFiltersService,
  findUsersLikeColumnService,
  updateUserService,
} from "./user.service";

// *==========*==========*==========POST==========*==========*==========*
export const createUser: RequestHandler = async (req, res) => {
  try {
    const userData: Pick<
      InsertUserDTO,
      "username" | "email" | "password" | "role" | "profilePicture"
    > = req.body;

    const user = await findUserByColumnService(
      userData.username,
      userData.email,
    );

    if (user) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const newUser = await createUserService(userData);

    createSuccessResponse(res, newUser, "User created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getUsers: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      role,
      isVerified,
    } = req.query as unknown as Partial<SelectUserDTO> & {
      page?: string;
      limit?: string;
    };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    // * Filter
    const filters = addFilters(UserModel, [
      role ? (table) => eq(table.role, role) : undefined,
      isVerified !== undefined
        ? (table) => eq(table.isVerified, isVerified)
        : undefined,
    ]);

    const { users, totalItems } = await findUsersByFiltersService(
      limit,
      offset,
      filters,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(users, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getUsersLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      username = "",
      email = "",
    } = req.query as unknown as Partial<SelectUserDTO> & {
      page?: string;
      limit?: string;
    };

    if (username && email) {
      return createErrorResponse(
        res,
        "You can only filter by either username or email, not both.",
        400, // Bad Request
      );
    }

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { users, totalItems } = await findUsersLikeColumnService(
      limit,
      offset,
      username ? UserModel.username : UserModel.email,
      username || email,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(users, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getUser = (by: "req.params" | "req.user"): RequestHandler => {
  return async (req, res) => {
    try {
      const userId = by === "req.params" ? req.params.userId : req.user?.id;

      if (!userId) {
        return createErrorResponse(
          res,
          "Something went wrong, id not found, you must login",
          403,
        );
      }

      const user = await findUserByIdService(userId);

      if (!user) {
        return createErrorResponse(res, "User not found", 404);
      }

      createSuccessResponse(res, user);
    } catch (error) {
      createErrorResponse(res, error);
    }
  };
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateUser = (by: "req.params" | "req.user"): RequestHandler => {
  return async (req, res) => {
    try {
      const userData: Partial<InsertUserDTO> = req.body;
      const userId = by === "req.params" ? req.params.userId : req.user?.id;

      if (!userId) {
        return createErrorResponse(
          res,
          "Something went wrong, id not found, you must login",
          403,
        );
      }

      const existingUser = await findUserByIdService(userId);

      if (!existingUser) {
        return createErrorResponse(res, "User not found", 404);
      }

      const filteredData =
        by === "req.user"
          ? {
              username: userData.username,
              email: userData.email,
              profilePicture: userData.profilePicture,
            }
          : userData;

      const updatedUser = await updateUserService(userId, filteredData);

      createSuccessResponse(res, updatedUser);
    } catch (error) {
      createErrorResponse(res, error);
    }
  };
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await deleteUserService(userId);

    if (!deletedUser) {
      return createErrorResponse(
        res,
        "Something cause user not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      {},
      `Successfully deleted user with id ${deletedUser.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
