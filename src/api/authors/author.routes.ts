import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import { uploadSingle } from "../../middleware/upload-file.middleware";
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
    uploadSingle("profilePicture", "authors"),
    // schemaValidatorMiddleware(createAuthorSchema),
    createAuthor,
  )
  .get(authMiddleware("optional"), getAuthors);
router.get("/search", authMiddleware("optional"), getAuthorsLikeColumn);
router
  .route("/:authorId")
  .get(authMiddleware("optional"), getAuthorById)
  .patch(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    uploadSingle("profilePicture", "authors"),
    updateAuthorById,
  )
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteAuthorById,
  );

export default router;
