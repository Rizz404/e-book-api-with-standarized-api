import { RequestHandler } from "express";
import db from "../config/database-config";
import UserTable from "../models/user-model";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/api-response-util";
import { eq } from "drizzle-orm";
import UserProfileTable from "../models/user-profile-model";

export const userResponse = {
  id: UserTable.id,
  username: UserTable.username,
  email: UserTable.email,
  role: UserTable.role,
  profilePicture: UserTable.profilePicture,
  isVerified: UserTable.isVerified,
  createdAt: UserTable.createdAt,
  updatedAt: UserTable.updatedAt,
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const {} = req.body;
  } catch (error) {}
};

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await db.select(userResponse).from(UserTable);

    createSuccessResponse(res, users);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// * Selalu kembalikan array kalau select pakai .select bukan .query
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await db
      .select(userResponse)
      .from(UserTable)
      .where((table) => eq(table.id, userId))
      .limit(1);

    if (!users.length) {
      return createErrorResponse(res, "User not found", 404);
    }

    createSuccessResponse(res, users[0]);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const user = (
      await db
        .select()
        .from(UserTable)
        .where((table) => eq(table.id, id))
        .limit(1)
        .leftJoin(UserProfileTable, eq(UserTable.id, UserProfileTable.userId))
    )[0];

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    createSuccessResponse(res, user);
  } catch (error) {
    createErrorResponse(res, error);
  }
};
