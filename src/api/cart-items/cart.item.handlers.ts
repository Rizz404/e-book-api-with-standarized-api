import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api.request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api.response.utils";
import { addFilters } from "../../utils/query.utils";
import { findCartByColumnService } from "../cart/cart.services";
import CartItemModel, {
  InsertCartItemDTO,
  SelectCartItemDTO,
} from "./cart.item.model";
import {
  createCartItemService,
  deleteCartItemService,
  findCartItemByColumnService,
  findCartItemByIdService,
  findCartItemsByCartId,
  findCartItemsLikeColumnService,
  updateCartItemService,
} from "./cart.item.services";

// *==========*==========*==========POST==========*==========*==========*
export const createCartItem: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const cartItemData: InsertCartItemDTO = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const userCart = await findCartByColumnService("userId", userId);

    if (!userCart) {
      return createErrorResponse(
        res,
        "Something went wrong user cart not found",
        404,
      );
    }

    const newCartItem = await createCartItemService({
      ...cartItemData,
      cartId: userCart.carts.id,
    });

    createSuccessResponse(
      res,
      newCartItem,
      "CartItem created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getCartItemsByCartId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const userCart = await findCartByColumnService("userId", userId);

    if (!userCart) {
      return createErrorResponse(
        res,
        "Something went wrong user cart not found",
        404,
      );
    }

    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectCartItemDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { cartItems, totalItems } = await findCartItemsByCartId(
      userCart.carts.id,
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(cartItems, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getCartItemById: RequestHandler = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await findCartItemByIdService(cartItemId);

    if (!cartItem) {
      return createErrorResponse(res, "CartItem not found", 404);
    }

    createSuccessResponse(res, cartItem);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateCartItemById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { cartItemId } = req.params;
    const cartItemData: Partial<InsertCartItemDTO> = req.body;

    if (!userId || !role) {
      return createErrorResponse(
        res,
        "Something went wrong causing user credentials not created",
        403,
      );
    }

    const userCart = await findCartByColumnService("userId", userId);

    if (!userCart) {
      return createErrorResponse(
        res,
        "Something went wrong user cart not found",
        404,
      );
    }

    const existingCartItem = await findCartItemByIdService(cartItemId);

    if (!existingCartItem) {
      return createErrorResponse(res, "CartItem not found", 404);
    }

    if (
      existingCartItem.cart_items.cartId !== userCart.carts.id &&
      role !== "ADMIN"
    ) {
      return createErrorResponse(
        res,
        "You don't have permission to update this cartItem",
        404,
      );
    }

    const updatedCartItem = await updateCartItemService(
      cartItemId,
      userId,
      cartItemData,
    );

    createSuccessResponse(res, updatedCartItem);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteCartItemById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { cartItemId } = req.params;

    if (!userId || !role) {
      return createErrorResponse(
        res,
        "Something went wrong causing user credentials not created",
        403,
      );
    }

    const userCart = await findCartByColumnService("userId", userId);

    if (!userCart) {
      return createErrorResponse(
        res,
        "Something went wrong user cart not found",
        404,
      );
    }

    const existingCartItem = await findCartItemByIdService(cartItemId);

    if (!existingCartItem) {
      return createErrorResponse(res, "CartItem not found", 404);
    }

    if (
      existingCartItem.cart_items.cartId !== userCart.carts.id &&
      role !== "ADMIN"
    ) {
      return createErrorResponse(
        res,
        "You don't have permission to update this cartItem",
        404,
      );
    }

    const deletedCartItem = await deleteCartItemService(cartItemId);

    if (!deletedCartItem) {
      return createErrorResponse(
        res,
        "Something cause cartItem not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted cartItem with id ${deletedCartItem.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
