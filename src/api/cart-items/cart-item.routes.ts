import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import {
  createCartItem,
  createUserCartItem,
  deleteCartItemById,
  getCartItemById,
  getCartItemsByCartId,
  getUserCartItems,
  updateCartItemById,
} from "./cart-item.handlers";

const router = express.Router();

router
  .route("/")
  .post(authMiddleware(), roleValidationMiddleware(["ADMIN"]), createCartItem);
router
  .route("/user")
  .post(authMiddleware(), createUserCartItem)
  .get(authMiddleware(), getUserCartItems);
router
  .route("/:cartItemId")
  .get(getCartItemById)
  .patch(authMiddleware(), updateCartItemById)
  .delete(authMiddleware(), deleteCartItemById);

export default router;
