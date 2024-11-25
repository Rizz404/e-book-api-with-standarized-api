import { RequestHandler } from "express";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/api-response-util";
import UserTable, {
  UserInsertType,
  UserSelectType,
} from "../models/user-model";
import bcrypt from "bcrypt";
import db from "../config/database-config";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export const signUp: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: Partial<UserInsertType> = req.body;

    if (!username || !email || !password) {
      createErrorResponse(
        res,
        "Username, email, and password are required",
        400
      );
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db
      .insert(UserTable)
      .values({ username, email, password: hashedPassword });

    createSuccessResponse(res, newUser, `User sign up successfully`, 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: Partial<UserSelectType> = req.body;

    if (!(username || email) || !password) {
      createErrorResponse(
        res,
        "Username or email and password are required",
        400
      );
      return;
    }

    if (username && email) {
      createErrorResponse(res, "Pick username or email for login", 400);
      return;
    }

    // * Selalu kembalikan array ya, jangan lupa
    const user = (
      await db
        .select()
        .from(UserTable)
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
      createErrorResponse(res, "User not found", 404);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      createErrorResponse(res, "Password not match", 400);
      return;
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
      }
    );

    // ! gak bisa langsung string inget
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_TOKEN as string,
      { expiresIn: "30d" }
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
      createErrorResponse(res, "Unauthorized", 401);
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN as string
    ) as { userId: string };

    if (!decoded) {
      createErrorResponse(res, "Invalid token", 403);
      return;
    }

    const user = (
      await db
        .select()
        .from(UserTable)
        .where((table) => eq(table.id, decoded.userId))
        .limit(1)
    )[0];

    if (!user) {
      createErrorResponse(res, "User not found", 404);
      return;
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_TOKEN as string,
      { expiresIn: "1d" }
    );

    createSuccessResponse(
      res,
      { newAccessToken },
      "Successfully get new access token",
      201
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// * Logout ada di client kecuali mau di server side taro refresh token di db
