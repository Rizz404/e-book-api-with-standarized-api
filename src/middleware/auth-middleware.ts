import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

import { createErrorResponse } from "../utils/api-response-util";

interface ReqUser {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  profilePicture: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}

export const authMiddleware = (
  authType: "required" | "optional" = "required",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization: authHeader } = req.headers;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const accessToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          accessToken,
          process.env.JWT_ACCESS_TOKEN as string,
        ) as ReqUser;

        if (!decoded.id) {
          createErrorResponse(res, "Invalid token", 403);
          return;
        }

        req.user = decoded;

        if (!req.user) {
          createErrorResponse(
            res,
            "Something wrong cause req.user not initialized",
            403,
          );
          return;
        }
      }

      if (authType === "required" && !req.user) {
        createErrorResponse(res, "Unauthorized", 401);
        return;
      }

      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        createErrorResponse(res, "Token expired", 401);
      } else {
        createErrorResponse(res, error);
      }
    }
  };
};
