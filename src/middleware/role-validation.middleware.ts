import { RequestHandler } from "express";

import { findUserByIdService } from "../api/users/user.services";
import { createErrorResponse } from "../utils/api-response.utils";

type AllowedRole = "USER" | "ADMIN";

const roleValidationMiddleware = (
  allowedRoles: AllowedRole[],
): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return createErrorResponse(
        res,
        "User must login to use this middleware",
        401,
      );
    }

    const currentUser = await findUserByIdService(user.id);

    if (!currentUser) {
      return createErrorResponse(
        res,
        "Something went wrong caused user not created",
        400,
      );
    }

    if (!allowedRoles.includes(currentUser.role)) {
      return createErrorResponse(
        res,
        `Role must be ${allowedRoles.join(", ")}`,
        403,
      );
    }

    next();
  };
};

export default roleValidationMiddleware;
