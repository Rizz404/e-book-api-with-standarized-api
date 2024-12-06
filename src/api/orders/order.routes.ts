import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createOrder,
  deleteOrderById,
  getOrderById,
  getOrders,
  updateOrderById,
} from "./order.handlers";
// import { createOrderSchema } from "./order.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    // schemaValidatorMiddleware(createOrderSchema),
    createOrder,
  )
  .get(authMiddleware(), getOrders);
router
  .route("/:orderId")
  .get(getOrderById)
  .patch(authMiddleware(), updateOrderById)
  .delete(authMiddleware(), deleteOrderById);

export default router;
