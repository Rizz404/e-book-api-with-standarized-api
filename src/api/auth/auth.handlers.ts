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

export const signUp: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: InsertUserDTO = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = (
      await db
        .select()
        .from(UserModel)
        .where((table) =>
          or(eq(table.username, username), eq(table.email, email)),
        )
        .limit(1)
    )[0];

    if (user) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const newUser = await db
      .insert(UserModel)
      .values({ username, email, password: hashedPassword });

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
    const user = (
      await db
        .select()
        .from(UserModel)
        .where((table) => {
          if (username) {
            return eq(table.username, username);
          }
          if (email) {
            return eq(table.email, email);
          }
        })
        .limit(1)
    )[0];

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return createErrorResponse(res, "Password not match", 400);
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_TOKEN as string,
      {
        expiresIn: "1d",
      },
    );

    // ! gak bisa langsung string inget
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_TOKEN as string,
      { expiresIn: "30d" },
    );

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

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN as string,
    ) as { userId: string };

    if (!decoded) {
      return createErrorResponse(res, "Invalid token", 403);
    }

    const user = (
      await db
        .select()
        .from(UserModel)
        .where((table) => eq(table.id, decoded.userId))
        .limit(1)
    )[0];

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_TOKEN as string,
      { expiresIn: "1d" },
    );

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
