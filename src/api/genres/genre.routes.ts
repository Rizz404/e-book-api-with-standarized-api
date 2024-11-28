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
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    // schemaValidatorMiddleware(createGenreSchema),
    createGenre,
  )
  .get(authMiddleware({ authType: "required" }), getGenres);
router.get("/search", getGenresLikeColumn);
router
  .route("/:genreId")
  .get(getGenreById)
  .patch(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    updateGenreById,
  )
  .delete(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    deleteGenreById,
  );

export default router;
