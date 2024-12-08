import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  createOrder,
  deleteOrderById,
  getOrderById,
  getOrders,
  getUserOrders,
  updateOrderById,
} from "./order.handlers";
// import { createOrderSchema } from "./order.validations";

const router = express.Router();

router
  .route("/")
  .post(authMiddleware(), createOrder)
  .get(authMiddleware(), getOrders);
router.route("/user").get(authMiddleware(), getUserOrders);
router
  .route("/:orderId")
  .get(getOrderById)
  .patch(authMiddleware(), roleValidationMiddleware(["ADMIN"]), updateOrderById)
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteOrderById,
  );

export default router;
