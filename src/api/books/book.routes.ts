import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  createBook,
  deleteBookById,
  getBookById,
  getBooks,
  getBooksLikeColumn,
  updateBookById,
} from "./book.handlers";
// import { createBookSchema } from "./book.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    // schemaValidatorMiddleware(createBookSchema),
    createBook,
  )
  .get(authMiddleware("optional"), getBooks);
router.get("/search", authMiddleware("optional"), getBooksLikeColumn);
router
  .route("/:bookId")
  .get(authMiddleware("optional"), getBookById)
  .patch(authMiddleware(), updateBookById)
  .delete(authMiddleware(), deleteBookById);

export default router;
