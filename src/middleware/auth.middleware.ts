import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";

import { decodeAccessToken } from "../api/auth/auth.services";
import { createErrorResponse } from "../utils/api-response.utils";

interface ReqUser {
  id: string;
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
        const decoded = decodeAccessToken(accessToken);

        if (!decoded.userId) {
          createErrorResponse(res, "Invalid token", 403);
          return;
        }

        req.user = { id: decoded.userId };

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
