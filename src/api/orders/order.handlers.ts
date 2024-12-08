import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { InsertOrderDTO, SelectOrderDTO } from "./order.model";
import {
  createOrderService,
  deleteOrderService,
  findOrderByIdService,
  findOrdersByFiltersService,
  updateOrderService,
} from "./order.services";

// *==========*==========*==========POST==========*==========*==========*
export const createOrder: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orderData: Pick<
      SelectOrderDTO,
      "bookId" | "quantity" | "shippingServiceId"
    > & { paymentMethodId: string } = req.body;

    if (!userId) {
      return createErrorResponse(res, "User id not found");
    }

    const newOrder = await createOrderService(
      {
        ...orderData,
        userId,
      },
      orderData.paymentMethodId,
    );

    createSuccessResponse(res, newOrder, "Order created", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      userId,
      shippingStatus,
      priceRange,
    } = req.query as unknown & {
      page?: string;
      limit?: string;
      userId?: string;
      shippingStatus?: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      priceRange?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const parsedPriceRangeFilter = priceRange
      ? (() => {
          const [start, end] = priceRange.split(",");
          return { start, end };
        })()
      : undefined;

    const { orders, totalItems } = await findOrdersByFiltersService(
      limit,
      offset,
      { userId, shippingStatus, priceRange: parsedPriceRangeFilter },
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(orders, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await findOrderByIdService(orderId);

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    createSuccessResponse(res, order);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateOrderById: RequestHandler = async (req, res) => {
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

    const { orderId } = req.params;
    const orderData: InsertOrderDTO = req.body;

    const existingOrder = await findOrderByIdService(orderId);

    if (!existingOrder) {
      return createErrorResponse(res, "Order not found", 404);
    }

    if (role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to update this order",
        404,
      );
    }

    const updatedOrder = await updateOrderService(orderId, { ...orderData });

    createSuccessResponse(res, updatedOrder);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteOrderById: RequestHandler = async (req, res) => {
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

    const { orderId } = req.params;

    const existingOrder = await findOrderByIdService(orderId);

    if (!existingOrder) {
      return createErrorResponse(res, "Order not found", 404);
    }

    if (role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to delete this order",
        404,
      );
    }

    const deletedOrder = await deleteOrderService(orderId);

    if (!deletedOrder) {
      return createErrorResponse(
        res,
        "Something cause order not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted order with id ${deletedOrder.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
