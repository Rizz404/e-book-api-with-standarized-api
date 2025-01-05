import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import {
  deleteCloudinaryImage,
  getPublicIdFromUrl,
  isCloudinaryUrl,
  isValidUrl,
} from "../../utils/cloudinary-utils";
import { addFilters } from "../../utils/query.utils";
import { InsertUserProfileDTO } from "../user-profile/user-profile.model";
import {
  createUserProfileService,
  findUserProfileByUserIdService,
  updateUserProfileService,
} from "../user-profile/user-profile.services";
import UserModel, { InsertUserDTO, SelectUserDTO } from "./user.model";
import {
  createUserService,
  deleteUserService,
  findUserByIdService,
  findUserByUsernameOrEmailService,
  findUsersByFiltersService,
  findUsersLikeColumnService,
  updateUserPasswordService,
  updateUserService,
} from "./user.services";

// *==========*==========*==========POST==========*==========*==========*
export const createUser: RequestHandler = async (req, res) => {
  try {
    const userData: Pick<
      InsertUserDTO,
      "username" | "email" | "password" | "role" | "profilePicture"
    > = req.body;

    const user = await findUserByUsernameOrEmailService(
      userData.username,
      userData.email,
    );

    if (user) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const newUser = await createUserService(userData);

    if (newUser) {
      await createUserProfileService(newUser.id);
    }

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

export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await findUserByIdService(userId);

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    createSuccessResponse(res, user);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
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

// *==========*==========*==========PATCH==========*==========*==========*
export const updateUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData: Partial<InsertUserDTO> = req.body;

    const existingUser = await findUserByIdService(userId);

    if (!existingUser) {
      return createErrorResponse(res, "User not found", 404);
    }

    const updatedUser = await updateUserService(userId, userData);

    createSuccessResponse(res, updatedUser);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const updateCurrentUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      username,
      email,
      profilePicture,
      bio,
      age,
    }: Partial<InsertUserDTO> & Partial<InsertUserProfileDTO> = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const existingUser = await findUserByIdService(userId);

    if (!existingUser) {
      return createErrorResponse(res, "User not found", 404);
    }

    // * Handle profile picture update
    let profilePictureUrl = existingUser.profilePicture;

    // * Jika ada file upload baru
    if (req.file?.cloudinary) {
      // * Hapus image lama dari Cloudinary jika itu adalah Cloudinary image
      if (
        existingUser.profilePicture &&
        isCloudinaryUrl(existingUser.profilePicture)
      ) {
        console.log(
          "Deleting old profile picture:",
          existingUser.profilePicture,
        );
        await deleteCloudinaryImage(existingUser.profilePicture);
      }
      profilePictureUrl = req.file.cloudinary.secure_url;
    }
    // * Jika ada URL string baru yang valid
    else if (profilePicture && isValidUrl(profilePicture)) {
      if (
        existingUser.profilePicture &&
        isCloudinaryUrl(existingUser.profilePicture) &&
        !isCloudinaryUrl(profilePicture)
      ) {
        console.log(
          "Deleting old profile picture:",
          existingUser.profilePicture,
        );
        await deleteCloudinaryImage(existingUser.profilePicture);
      }
      profilePictureUrl = profilePicture;
    }

    const updatedUser = await updateUserService(userId, {
      username,
      email,
      profilePicture: profilePictureUrl,
    });

    const existingUserProfile = await findUserProfileByUserIdService(userId);

    if (!existingUserProfile) {
      return createErrorResponse(res, "User profile not found", 404);
    }

    const updatedUserProfile = await updateUserProfileService(userId, {
      bio,
      age,
    });

    createSuccessResponse(res, {
      ...updatedUser,
      userProfile: updatedUserProfile,
    });
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const updateCurrentUserPassword: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { storedPassword, newPassword } = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    if (!storedPassword || !newPassword) {
      return createErrorResponse(
        res,
        "Both current and new passwords are required",
        400,
      );
    }

    // * Update password melalui service
    await updateUserPasswordService(userId, storedPassword, newPassword);

    createSuccessResponse(res, undefined, "Password updated successfully");
  } catch (error) {
    createErrorResponse(res, error);
  }
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
