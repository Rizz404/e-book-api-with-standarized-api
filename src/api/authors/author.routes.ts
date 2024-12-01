import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createAuthor,
  deleteAuthorById,
  getAuthorById,
  getAuthors,
  getAuthorsLikeColumn,
  updateAuthorById,
} from "./author.handlers";
// import { createAuthorSchema } from "./author.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    // schemaValidatorMiddleware(createAuthorSchema),
    createAuthor,
  )
  .get(authMiddleware(), getAuthors);
router.get("/search", getAuthorsLikeColumn);
router
  .route("/:authorId")
  .get(getAuthorById)
  .patch(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    updateAuthorById,
  )
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteAuthorById,
  );

export default router;
