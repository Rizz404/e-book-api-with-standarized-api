import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  cartCheckout,
  createCart,
  deleteCartById,
  getCartById,
  getCarts,
} from "./cart.handlers";
// import { createCartSchema } from "./cart.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    // schemaValidatorMiddleware(createCartSchema),
    createCart,
  )
  .get(authMiddleware(), getCarts);
router.post("/checkout", authMiddleware(), cartCheckout);
router
  .route("/:cartId")
  .get(getCartById)
  .delete(authMiddleware(), deleteCartById);

export default router;
