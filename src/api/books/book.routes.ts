import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import { uploadFields } from "../../middleware/upload-file.middleware";
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

const uploadBookFields = uploadFields(
  [
    { name: "fileUrl", maxCount: 1 }, // * Hanya 1 file
    { name: "bookPictureString", maxCount: 7 }, // * Maksimal 10 gambar
  ],
  "books",
);

router
  .route("/")
  .post(
    authMiddleware(),
    // schemaValidatorMiddleware(createBookSchema),
    uploadBookFields,
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
