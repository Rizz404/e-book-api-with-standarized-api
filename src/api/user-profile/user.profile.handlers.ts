import { RequestHandler } from "express";

import {
  createErrorResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import { InsertUserProfileDTO } from "./user.profile.model";
import {
  createUserProfileService,
  findUserProfileByUserIdService,
  updateUserProfileService,
} from "./user.profile.services";

export const createCurrentUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(res, "User id not found", 404);
    }

    const userProfileExist = await findUserProfileByUserIdService(userId);

    if (userProfileExist) {
      return createErrorResponse(res, "User profile already created", 400);
    }

    const newUserProfile = await createUserProfileService(userId);

    createSuccessResponse(res, newUserProfile, "User profile created", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const updateCurrentUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bio }: InsertUserProfileDTO = req.body;

    if (!userId) {
      return createErrorResponse(res, "User id not found", 404);
    }

    const updatedUserProfile = await updateUserProfileService(userId, { bio });

    createSuccessResponse(res, updatedUserProfile, "User profile updated");
  } catch (error) {
    createErrorResponse(res, error);
  }
};
