import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  followGenreByGenreId,
  getGenresFollowed,
  unFollowGenreByGenreId,
} from "./genre-follow.handlers";
// import { createGenreSchema } from "./genre-follow.validations";

const router = express.Router();

router.route("/").get(authMiddleware(), getGenresFollowed);
router
  .route("/:genreId")
  .post(authMiddleware(), followGenreByGenreId)
  .delete(authMiddleware(), unFollowGenreByGenreId);

export default router;
