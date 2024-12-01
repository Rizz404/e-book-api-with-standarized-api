import { RequestHandler } from "express";

import allowedApiKeys from "../config/allowed-api-keys";
import { createErrorResponse } from "../utils/api-response-util";

const apiKeyMiddleware: RequestHandler = (req, res, next) => {
  try {
    const { "x-api-key": apiKey } = req.headers;

    if (!apiKey || typeof apiKey !== "string") {
      return createErrorResponse(res, "Api key not provided", 401);
    }

    if (!allowedApiKeys.includes(apiKey)) {
      return createErrorResponse(
        res,
        "Api key is incorrect, contact sigma Rizqiansyah",
        401,
      );
    }

    next();
  } catch (error) {
    createErrorResponse(res, error);
    next(error);
  }
};

export default apiKeyMiddleware;
