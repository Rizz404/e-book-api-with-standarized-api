import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  deleteTransactionById,
  getTransactionById,
  getTransactions,
  updateTransactionById,
} from "./transaction.handlers";
// import { createTransactionSchema } from "./transaction.validations";

const router = express.Router();

router.route("/").get(authMiddleware(), getTransactions);
router
  .route("/:transactionId")
  .get(getTransactionById)
  .patch(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    updateTransactionById,
  )
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteTransactionById,
  );

export default router;
