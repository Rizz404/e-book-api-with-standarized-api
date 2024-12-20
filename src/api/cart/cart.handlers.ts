import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { SelectCartItemDTO } from "../cart-items/cart-item.model";
import { InsertCartDTO, SelectCartDTO } from "./cart.model";
import {
  cartCheckoutService,
  createCartService,
  deleteCartService,
  findCartByColumnService,
  findCartByIdService,
  findCartsByFiltersService,
  ICartCheckoutServiceParams,
} from "./cart.services";

// *==========*==========*==========POST==========*==========*==========*
export const createCart: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const cartData: InsertCartDTO = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const cart = await findCartByColumnService("userId", userId);

    if (cart) {
      return createErrorResponse(res, "Cart already exist", 400);
    }

    const newCart = await createCartService({ ...cartData, userId });

    createSuccessResponse(res, newCart, "Cart created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const cartUserCheckout: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      cartCheckoutData,
      paymentMethodId,
    }: {
      cartCheckoutData: ICartCheckoutServiceParams[];
      paymentMethodId: string;
    } = req.body;

    console.log(`Cart checkout body${cartCheckoutData}`);
    console.log(`Payment method id body${paymentMethodId}`);

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const newCart = await cartCheckoutService(
      userId,
      cartCheckoutData,
      paymentMethodId,
    );

    createSuccessResponse(res, newCart, "Cart checkout successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getCarts: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectCartDTO> & {
        page?: string;
        limit?: string;
      };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { carts, totalItems } = await findCartsByFiltersService(
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(carts, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getCartById: RequestHandler = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await findCartByIdService(cartId);

    if (!cart) {
      return createErrorResponse(res, "Cart not found", 404);
    }

    createSuccessResponse(res, cart);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getCurrentUserCart: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const cart = await findCartByColumnService("userId", userId);

    if (!cart) {
      return createErrorResponse(res, "Cart not found", 404);
    }

    createSuccessResponse(res, cart);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteCartById: RequestHandler = async (req, res) => {
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

    const { cartId } = req.params;

    const existingCart = await findCartByIdService(cartId);

    if (!existingCart) {
      return createErrorResponse(res, "Cart not found", 404);
    }

    if (existingCart.users?.id !== userId && role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to delete this cart",
        404,
      );
    }

    const deletedCart = await deleteCartService(cartId);

    if (!deletedCart) {
      return createErrorResponse(
        res,
        "Something cause cart not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted cart with id ${deletedCart.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
