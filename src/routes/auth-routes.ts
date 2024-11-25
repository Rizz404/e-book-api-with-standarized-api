import express from "express";
import {
  refreshExpiredToken,
  signIn,
  signUp,
} from "../controller/auth-controller";

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshExpiredToken);

export default router;
