import { RequestHandler } from "express";
import { createErrorResponse } from "../utils/api-response-util";

type AllowedRole = "USER" | "ADMIN";

const roleValidationMiddleware = (
  allowedRoles: AllowedRole[],
): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return createErrorResponse(
        res,
        "User must login to use this middleware",
        401,
      );
    }

    if (!allowedRoles.includes(user.role)) {
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
