import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response-util";
import parsePagination from "../../utils/parse-pagination";
import { addFilters } from "../../utils/query-utils";
import CartModel, { InsertCartDTO, SelectCartDTO } from "./cart.model";
import {
  createCartService,
  deleteCartService,
  findCartByColumnService,
  findCartByIdService,
  findCartsByFiltersService,
  findCartsLikeColumnService,
  updateCartService,
} from "./cart.services";

// *==========*==========*==========POST==========*==========*==========*
export const createCart: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const cartData: InsertCartDTO = req.body;

    const cart = await findCartByColumnService("slug", cartData.slug);

    if (cart) {
      return createErrorResponse(res, "Cart already exist", 400);
    }

    const newCart = await createCartService({ ...cartData, sellerId: userId });

    createSuccessResponse(res, newCart, "Cart created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getCarts: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      status,
    } = req.query as unknown as Partial<SelectCartDTO> & {
      page?: string;
      limit?: string;
    };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    // * Filter
    const filters = addFilters(CartModel, [
      status ? (table) => eq(table.status, status) : undefined,
    ]);

    const { carts, totalItems } = await findCartsByFiltersService(
      limit,
      offset,
      filters,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(carts, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getCartsLikeColumn: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      title = "",
      slug = "",
    } = req.query as unknown as Partial<SelectCartDTO> & {
      page?: string;
      limit?: string;
    };

    if (title && slug) {
      return createErrorResponse(
        res,
        "You can only filter by either title or slug, not both.",
        400, // Bad Request
      );
    }

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const { carts, totalItems } = await findCartsLikeColumnService(
      limit,
      offset,
      title ? CartModel.title : CartModel.slug,
      title || slug,
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

// *==========*==========*==========PATCH==========*==========*==========*
export const updateCartById: RequestHandler = async (req, res) => {
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
    const cartData: Partial<InsertCartDTO> = req.body;

    const existingCart = await findCartByIdService(cartId);

    console.log(`userId: ${userId}`);
    console.log(`sellerId: ${existingCart.sellerId}`);
    console.log(`role: ${role}`);

    if (!existingCart) {
      return createErrorResponse(res, "Cart not found", 404);
    }

    if (existingCart.sellerId !== userId && role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to update this cart",
        404,
      );
    }

    const updatedCart = await updateCartService(cartId, userId, cartData);

    createSuccessResponse(res, updatedCart);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

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

    if (existingCart.sellerId !== userId && role !== "ADMIN") {
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
