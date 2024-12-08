import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  cartUserCheckout,
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
// * Hardest part not yet tested
router.post("/user/checkout", authMiddleware(), cartUserCheckout);
router
  .route("/:cartId")
  .get(getCartById)
  .delete(authMiddleware(), deleteCartById);

export default router;
