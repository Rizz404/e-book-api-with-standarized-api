import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  createWishlistByBookId,
  deleteWishlistByBookId,
  getCurrentUserWishlist,
  getWishlistByBookId,
} from "./book-wishlist.handlers";

// import { createWishlistSchema } from "./wishlist-follow.validations";

const router = express.Router();

router.route("/").get(authMiddleware(), getCurrentUserWishlist);
router
  .route("/:bookId")
  .get(authMiddleware(), getWishlistByBookId)
  .post(authMiddleware(), createWishlistByBookId)
  .delete(authMiddleware(), deleteWishlistByBookId);

export default router;
