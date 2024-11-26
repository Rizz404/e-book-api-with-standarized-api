import express from "express";
import {
  refreshExpiredToken,
  signIn,
  signUp,
} from "../controller/auth-controller";
import rateLimit from "express-rate-limit";
import RATE_LIMITER_OPTION from "../constants/limiter-constants";

const router = express.Router();

router.post("/sign-up", rateLimit(RATE_LIMITER_OPTION.signUp), signUp);
router.post("/sign-in", rateLimit(RATE_LIMITER_OPTION.signIn), signIn);
router.post("/refresh-token", refreshExpiredToken);

export default router;
