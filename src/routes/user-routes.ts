import express from "express";
import {
  getUserById,
  getUserProfile,
  getUsers,
} from "../controller/user-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

router.route("/").get(authMiddleware({ authType: "required" }), getUsers);
router
  .route("/profile")
  .get(authMiddleware({ authType: "required" }), getUserProfile);
router.route("/:userId").get(getUserById);

export default router;
