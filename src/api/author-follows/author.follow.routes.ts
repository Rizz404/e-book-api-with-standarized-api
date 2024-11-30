import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  followAuthorByAuthorId,
  getAuthorsFollowed,
  unFollowAuthorByAuthorId,
} from "./author.follow.handlers";
// import { createAuthorSchema } from "./author.follow.validations";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware({ authType: "required" }), getAuthorsFollowed);
router
  .route("/:authorId")
  .post(authMiddleware({ authType: "required" }), followAuthorByAuthorId)
  .delete(authMiddleware({ authType: "required" }), unFollowAuthorByAuthorId);

export default router;
