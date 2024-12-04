import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createPaymentMethod,
  deletePaymentMethodById,
  getPaymentMethodById,
  getPaymentMethods,
  getPaymentMethodsLikeColumn,
  updatePaymentMethodById,
} from "./payment.method.handlers";
// import { createPaymentMethodSchema } from "./payment.method.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    // schemaValidatorMiddleware(createPaymentMethodSchema),
    createPaymentMethod,
  )
  .get(getPaymentMethods);
router.get("/search", getPaymentMethodsLikeColumn);
router
  .route("/:paymentMethodId")
  .get(getPaymentMethodById)
  .patch(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    updatePaymentMethodById,
  )
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deletePaymentMethodById,
  );

export default router;
