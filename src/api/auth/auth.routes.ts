import express from "express";
import rateLimit from "express-rate-limit";
import RATE_LIMITER_OPTION from "../../constants/limiter-constants";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import { signInSchema, signUpSchema } from "./auth.schema";
import { refreshExpiredToken, signIn, signUp } from "./auth.handlers";
import { authMiddleware } from "../../middleware/auth-middleware";

const router = express.Router();

router.post(
  "/sign-up",
  rateLimit(RATE_LIMITER_OPTION.signUp),
  schemaValidatorMiddleware(signUpSchema),
  signUp,
);
router.post(
  "/sign-in",
  rateLimit(RATE_LIMITER_OPTION.signIn),
  schemaValidatorMiddleware(signInSchema),
  signIn,
);
router.post(
  "/refresh-token",
  authMiddleware({ authType: "required" }),
  refreshExpiredToken,
);

export default router;
