import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import {
  deleteTransactionById,
  getTransactionById,
  getTransactions,
  updateTransactionById,
  xenditInvoiceWebhook,
} from "./transaction.handlers";

const router = express.Router();

router.route("/").get(authMiddleware(), getTransactions);
router.route("/webhook/xendit").post(xenditInvoiceWebhook);

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
