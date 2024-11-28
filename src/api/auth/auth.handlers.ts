import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import db from "../../config/database-config";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import UserModel, { InsertUserDTO, SelectUserDTO } from "../users/user.model";
import {
  createUserService,
  findUserByColumnService,
  findUserByIdService,
} from "../users/user.services";
import {
  decodeRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  validatePassword,
} from "./auth.services";

export const signUp: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: InsertUserDTO = req.body;

    const user = await findUserByColumnService(username, email);

    if (user) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const newUser = await createUserService({ username, email, password });

    createSuccessResponse(res, newUser, "User sign up successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: SelectUserDTO = req.body;

    if (username && email) {
      return createErrorResponse(res, "Pick username or email for login", 400);
    }

    // * Selalu kembalikan array ya, jangan lupa
    const user = await findUserByColumnService(username, email, true);

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    if (!user.password) {
      return createErrorResponse(res, "Password not found", 400);
    }

    const passwordMatch = await validatePassword(password, user.password);
    if (!passwordMatch) {
      return createErrorResponse(res, "Password not match", 400);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    const userCredentials = {
      ...user,
      accessToken: accessToken, // * Objek user
      refreshToken: refreshToken, // * Id user
    };

    createSuccessResponse(res, userCredentials);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const refreshExpiredToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return createErrorResponse(res, "Unauthorized", 401);
    }

    const decoded = decodeRefreshToken(refreshToken);

    if (!decoded) {
      return createErrorResponse(res, "Invalid token", 403);
    }

    const user = await findUserByIdService(decoded.userId);

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    const newAccessToken = generateAccessToken(user);

    createSuccessResponse(
      res,
      { newAccessToken },
      "Successfully get new access token",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// * Logout ada di client kecuali mau di server side taro refresh token di db
