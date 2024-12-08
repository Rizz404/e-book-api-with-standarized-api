import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  createBookReview,
  deleteBookReviewById,
  getBookReviewById,
  getBookReviews,
  updateBookReviewById,
} from "./book-review.handlers";
// import { createBookReviewSchema } from "./book-review.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    // schemaValidatorMiddleware(createBookReviewSchema),
    createBookReview,
  )
  .get(getBookReviews);
router
  .route("/:bookReviewId")
  .get(getBookReviewById)
  .patch(authMiddleware(), updateBookReviewById)
  .delete(authMiddleware(), deleteBookReviewById);

export default router;
