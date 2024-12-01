import { RequestHandler } from "express";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import parsePagination from "../../utils/parse-pagination";
import PaymentMethodModel, {
  InsertPaymentMethodDTO,
  SelectPaymentMethodDTO,
} from "./payment.method.model";
import {
  createPaymentMethodService,
  deletePaymentMethodService,
  findPaymentMethodByColumnService,
  findPaymentMethodByIdService,
  findPaymentMethodsByFiltersService,
  findPaymentMethodsLikeColumnService,
  updatePaymentMethodService,
} from "./payment.method.services";

// *==========*==========*==========POST==========*==========*==========*
export const createPaymentMethod: RequestHandler = async (req, res) => {
  try {
    const paymentMethodData: InsertPaymentMethodDTO = req.body;

    const paymentMethod = await findPaymentMethodByColumnService(
      paymentMethodData.name,
    );

    if (paymentMethod) {
      return createErrorResponse(res, "PaymentMethod already exist", 400);
    }

    const newPaymentMethod =
      await createPaymentMethodService(paymentMethodData);

    createSuccessResponse(
      res,
      newPaymentMethod,
      "PaymentMethod created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getPaymentMethods: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectPaymentMethodDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { paymentMethods, totalItems } =
      await findPaymentMethodsByFiltersService(limit, offset);

    createSuccessResponse(
      res,
      createPaginatedResponse(
        paymentMethods,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getPaymentMethodsLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      name = "",
    } = req.query as unknown as Partial<SelectPaymentMethodDTO> & {
      page?: string;
      limit?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { paymentMethods, totalItems } =
      await findPaymentMethodsLikeColumnService(
        limit,
        offset,
        PaymentMethodModel.name,
        name,
      );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        paymentMethods,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getPaymentMethodById: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    const paymentMethod = await findPaymentMethodByIdService(paymentMethodId);

    if (!paymentMethod) {
      return createErrorResponse(res, "PaymentMethod not found", 404);
    }

    createSuccessResponse(res, paymentMethod);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updatePaymentMethodById: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const paymentMethodData: Partial<InsertPaymentMethodDTO> = req.body;

    const existingPaymentMethod =
      await findPaymentMethodByIdService(paymentMethodId);

    if (!existingPaymentMethod) {
      return createErrorResponse(res, "PaymentMethod not found", 404);
    }

    const updatedPaymentMethod = await updatePaymentMethodService(
      paymentMethodId,
      paymentMethodData,
    );

    createSuccessResponse(res, updatedPaymentMethod);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deletePaymentMethodById: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const deletedPaymentMethod =
      await deletePaymentMethodService(paymentMethodId);

    if (!deletedPaymentMethod) {
      return createErrorResponse(
        res,
        "Something cause paymentMethod not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted paymentMethod with id ${deletedPaymentMethod.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
