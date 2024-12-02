import { RequestHandler } from "express";
import { SendMailOptions } from "nodemailer";

import { createConfirmationEmailResponse } from "../../config/mailgen-config";
import transporter from "../../config/nodemailer-transporter-config";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import { createUserProfileService } from "../user-profile/user.profile.services";
import { InsertUserDTO, SelectUserDTO } from "../users/user.model";
import {
  createUserService,
  findUserByColumnService,
  findUserByIdService,
  findUserByUsernameOrEmailService,
  updateUserService,
} from "../users/user.services";
import {
  decodeEmailConfirmationToken,
  decodeRefreshToken,
  generateAccessToken,
  generateEmailConfirmationToken,
  generateRefreshToken,
  validatePassword,
} from "./auth.services";

export const signUp: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: InsertUserDTO = req.body;

    const user = await findUserByUsernameOrEmailService(username, email);

    if (user) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const newUser = await createUserService({ username, email, password });

    if (newUser) {
      await createUserProfileService(newUser.id);
    }

    const token = generateEmailConfirmationToken(newUser.id, newUser.email);

    const redirectLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

    const message: SendMailOptions = {
      from: process.env.GMAIL_APP_USER,
      to: newUser.email,
      subject: "Semakin hari semakin dibelakang",
      html: createConfirmationEmailResponse(username, redirectLink),
    };

    const emailSent = await transporter.sendMail(message);

    if (!emailSent) {
      return createErrorResponse(res, "Email not sent, try again", 400);
    }

    createSuccessResponse(
      res,
      undefined,
      "Check your email and confirm your email",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: InsertUserDTO = req.body;

    if (username && email) {
      return createErrorResponse(res, "Pick username or email for login", 400);
    }

    // * Selalu kembalikan array ya, jangan lupa
    const user = await findUserByUsernameOrEmailService(username, email, true);

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    if (!user.password) {
      return createErrorResponse(res, "Password not found", 400);
    }

    if (!user.isEmailVerified) {
      return createErrorResponse(res, "Email not verified", 403);
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

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query as unknown as { token?: string };

    if (!token) {
      return createErrorResponse(res, "Token not found in query params", 404);
    }

    const decodedToken = decodeEmailConfirmationToken(token);
    const user = await findUserByIdService(decodedToken.userId);

    if (user.isEmailVerified) {
      return createErrorResponse(
        res,
        "Email already verified, you may now leave",
        400,
      );
    }

    if (!user || user.email !== decodedToken.email) {
      return createErrorResponse(res, "Invalid token", 403);
    }

    await updateUserService(user.id, {
      isEmailVerified: true,
    });

    createSuccessResponse(res, undefined, "Email verified");
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// * Logout ada di client kecuali mau di server side taro refresh token di db
