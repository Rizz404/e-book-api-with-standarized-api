import { RequestHandler } from "express";
import rateLimit, { Options } from "express-rate-limit";

const apiLimiterMiddleware = (options: Partial<Options>): RequestHandler => {
  return rateLimit(options);
};

export default apiLimiterMiddleware;
