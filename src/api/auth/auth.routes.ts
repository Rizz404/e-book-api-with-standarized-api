import express from "express";

import RATE_LIMITER_OPTION from "../../constants/limiter.constants";
import apiLimiterMiddleware from "../../middleware/api-limiter.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  refreshExpiredToken,
  signIn,
  signUp,
  verifyEmail,
} from "./auth.handlers";
import { signInSchema, signUpSchema } from "./auth.validation";

const router = express.Router();

router.post(
  "/sign-up",
  apiLimiterMiddleware(RATE_LIMITER_OPTION.signUp),
  schemaValidatorMiddleware(signUpSchema),
  signUp,
);
router.post(
  "/sign-in",
  apiLimiterMiddleware(RATE_LIMITER_OPTION.signIn),
  schemaValidatorMiddleware(signInSchema),
  signIn,
);
router.post("/refresh-token", refreshExpiredToken);
router.get("/verify-email", verifyEmail);

export default router;
