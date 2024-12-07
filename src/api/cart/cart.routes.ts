import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import {
  cartCheckout,
  createCart,
  deleteCartById,
  getCartById,
  getCarts,
  getCurrentUserCart,
} from "./cart.handlers";

const router = express.Router();

router.route("/").get(authMiddleware(), getCarts);
router
  .route("/user")
  .post(authMiddleware(), createCart)
  .get(authMiddleware(), getCurrentUserCart);
router.post("/checkout", authMiddleware(), cartCheckout);
router
  .route("/:cartId")
  .get(getCartById)
  .delete(authMiddleware(), deleteCartById);

export default router;
