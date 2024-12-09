import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  followAuthorByAuthorId,
  getAuthorFollowByAuthorId,
  getAuthorsFollowed,
  unFollowAuthorByAuthorId,
} from "./author-follow.handlers";
// import { createAuthorSchema } from "./author-follow.validations";

const router = express.Router();

router.route("/").get(authMiddleware(), getAuthorsFollowed);
router
  .route("/:authorId")
  .get(authMiddleware(), getAuthorFollowByAuthorId)
  .post(authMiddleware(), followAuthorByAuthorId)
  .delete(authMiddleware(), unFollowAuthorByAuthorId);

export default router;
