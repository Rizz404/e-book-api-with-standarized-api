import { Options } from "express-rate-limit";
import { APIResponse, createErrorResponse } from "../utils/api-response-util";

type RateLimiterOptionKey = "api" | "signUp" | "signIn";

const RATE_LIMITER_OPTION: Record<RateLimiterOptionKey, Partial<Options>> = {
  api: {
    windowMs: 30 * 60 * 1000, // * 30 menit
    limit: 500, // * 500 request per 30 menit
    message: "Too many requests. Please try again later",
  },
  signUp: {
    windowMs: 15 * 60 * 1000, // * 15 menit
    limit: 5, // * 5 request per 15 menit
    message: "Too many login attempts. Please try again later.",
  },
  signIn: {
    windowMs: 15 * 60 * 1000, // * 15 menit
    limit: 5, // * 5 request per 15 menit
    handler: (req, res) => {
      createErrorResponse(
        res,
        "You have exceeded the maximum number of login attempts. Please try again later.",
        429,
      );
    },
    keyGenerator: (req) => req.body.username || req.ip, // * Defaultnya ip
  },
};

export default RATE_LIMITER_OPTION;
