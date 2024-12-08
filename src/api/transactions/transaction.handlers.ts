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
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return createErrorResponse(
        res,
        "Something went wrong causing user credentials not created",
        403,
      );
    }

    const { transactionId } = req.params;
    const transactionData: Partial<InsertTransactionDTO> = req.body;

    const existingTransaction = await findTransactionByIdService(transactionId);

    if (!existingTransaction) {
      return createErrorResponse(res, "Transaction not found", 404);
    }

    if (role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to update this transaction",
        404,
      );
    }

    const updatedTransaction = await updateTransactionService(
      transactionId,
      userId,
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
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) {
      return createErrorResponse(
        res,
        "Something went wrong causing user credentials not created",
        403,
      );
    }

    const { transactionId } = req.params;

    const existingTransaction = await findTransactionByIdService(transactionId);

    if (!existingTransaction) {
      return createErrorResponse(res, "Transaction not found", 404);
    }

    if (role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to delete this transaction",
        404,
      );
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
