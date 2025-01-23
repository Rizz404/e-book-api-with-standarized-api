import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

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
  testZendit,
  updateTransactionService,
} from "./transaction.services";

// *==========*==========*==========POST==========*==========*==========*

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

export const xenditTest: RequestHandler = async (req, res) => {
  try {
    // Destructure with default values and type checking
    const {
      amount,
      invoiceDuration = "172800", // Default value
      externalId,
      description,
      currency = "IDR", // Default value
      reminderTime = 1,
      payerEmail,
    } = req.body;

    // Validate required fields
    if (!amount || !externalId || !description || !payerEmail) {
      return createErrorResponse(res, new Error("Missing required fields"));
    }

    const response = await testZendit({
      amount,
      invoiceDuration,
      externalId,
      description,
      currency,
      reminderTime,
      payerEmail,
    });

    createSuccessResponse(res, response, "Successfully created Xendit invoice");
  } catch (error) {
    console.error("Xendit Test Error:", error);
    createErrorResponse(res, error);
  }
};
