import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import db from "../../config/database.config";
import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { addFilters } from "../../utils/query.utils";
import TransactionModel, {
  InsertTransactionDTO,
  SelectTransactionDTO,
} from "./transaction.model";
import {
  deleteTransactionService,
  findTransactionByColumnService,
  findTransactionByIdService,
  findTransactionsByFiltersService,
  updateTransactionService,
} from "./transaction.services";

// *==========*==========*==========POST==========*==========*==========*

export const xenditInvoiceWebhook: RequestHandler = async (req, res) => {
  try {
    const callbackToken = req.headers["x-callback-token"];
    const payload: {
      status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
      external_id: string;
    } = req.body;

    if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
      return createErrorResponse(res, "Unauthorized webhook request", 401);
    }
    const { external_id: externalId } = payload;

    if (externalId === "invoice_123124123") {
      return createSuccessResponse(
        res,
        undefined,
        "Testing webhook success",
        200,
      );
    }

    let response;

    switch (payload.status) {
      case "PAID":
        response = await updateTransactionService(externalId, {
          status: "COMPLETED",
        });
        break;
      case "FAILED":
        response = await updateTransactionService(externalId, {
          status: "FAILED",
        });
        break;

      default:
        break;
    }

    createSuccessResponse(
      res,
      response,
      "Webhook received successfully and updating transaction base on payload status",
      200,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getTransactions: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
    } = req.query as unknown as Partial<SelectTransactionDTO> & {
      page?: string;
      limit?: string;
    };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { transactions, totalItems } = await findTransactionsByFiltersService(
      limit,
      offset,
      { ...(status && { status }) },
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        transactions,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getTransactionById: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await findTransactionByIdService(transactionId);

    if (!transaction) {
      return createErrorResponse(res, "Transaction not found", 404);
    }

    createSuccessResponse(res, transaction);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateTransactionById: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transactionData: Partial<InsertTransactionDTO> = req.body;

    const existingTransaction = await findTransactionByIdService(transactionId);

    if (!existingTransaction) {
      return createErrorResponse(res, "Transaction not found", 404);
    }

    const updatedTransaction = await updateTransactionService(
      transactionId,
      transactionData,
    );

    createSuccessResponse(res, updatedTransaction);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteTransactionById: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const existingTransaction = await findTransactionByIdService(transactionId);

    if (!existingTransaction) {
      return createErrorResponse(res, "Transaction not found", 404);
    }

    const deletedTransaction = await deleteTransactionService(transactionId);

    if (!deletedTransaction) {
      return createErrorResponse(
        res,
        "Something cause transaction not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted transaction with id ${deletedTransaction.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
