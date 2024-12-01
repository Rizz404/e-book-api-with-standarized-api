import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  followUserByUserId,
  getUsersFollowed,
  unFollowUserByUserId,
} from "./user.follow.handlers";
// import { createUserSchema } from "./user.follow.validations";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware({ authType: "required" }), getUsersFollowed);
router
  .route("/:userId")
  .post(authMiddleware({ authType: "required" }), followUserByUserId)
  .delete(authMiddleware({ authType: "required" }), unFollowUserByUserId);

export default router;
