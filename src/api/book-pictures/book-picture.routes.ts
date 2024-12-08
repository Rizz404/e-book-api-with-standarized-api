import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  addBookPictures,
  deleteBookPictureById,
  getBookPictureById,
} from "./book-picture.handlers";
// import { createBookSchema } from "./book-picture.validations";

const router = express.Router();

router.route("/").post(
  authMiddleware(),
  // schemaValidatorMiddleware(createBookSchema),
  addBookPictures,
);
router
  .route("/:bookPictureId")
  .get(getBookPictureById)
  .delete(authMiddleware(), deleteBookPictureById);

export default router;
