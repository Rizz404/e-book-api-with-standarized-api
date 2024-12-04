import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createGenre,
  deleteGenreById,
  getGenreById,
  getGenres,
  getGenresLikeColumn,
  updateGenreById,
} from "./genre.handlers";
// import { createGenreSchema } from "./genre.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    // schemaValidatorMiddleware(createGenreSchema),
    createGenre,
  )
  .get(getGenres);
router.get("/search", getGenresLikeColumn);
router
  .route("/:genreId")
  .get(getGenreById)
  .patch(authMiddleware(), roleValidationMiddleware(["ADMIN"]), updateGenreById)
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteGenreById,
  );

export default router;
