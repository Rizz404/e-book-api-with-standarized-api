import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createCartItem,
  deleteCartItemById,
  getCartItemById,
  getCartItemsByCartId,
  updateCartItemById,
} from "./cart.item.handlers";
// import { createCartItemSchema } from "./cart.item.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    // schemaValidatorMiddleware(createCartItemSchema),
    createCartItem,
  )
  .get(authMiddleware(), getCartItemsByCartId);
router
  .route("/:cartItemId")
  .get(getCartItemById)
  .patch(authMiddleware(), updateCartItemById)
  .delete(authMiddleware(), deleteCartItemById);

export default router;
