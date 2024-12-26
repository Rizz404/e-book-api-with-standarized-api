import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { updateBookWishlistCountService } from "../books/book.services";
import {
  createWishlistService,
  deleteWishlistService,
  findBookWishlistService,
  findOneBookWishlistService,
} from "./book-wishlist.services";

// *==========*==========*==========POST==========*==========*==========*
export const createWishlistByBookId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const alreadyAddToWishlist = await findOneBookWishlistService(
      bookId,
      userId,
    );

    if (alreadyAddToWishlist) {
      return createErrorResponse(res, "Already add book to this wishlist", 400);
    }

    const addedToWishlist = await createWishlistService({
      userId: userId,
      bookId: bookId,
    });

    if (addedToWishlist) {
      await updateBookWishlistCountService(bookId, "increment");
    }

    createSuccessResponse(
      res,
      addedToWishlist,
      `Successfully add book to wishlist with id ${bookId}`,
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getCurrentUserWishlist: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = "1", limit = "10" } = req.query as unknown as {
      page?: string;
      limit?: string;
    };

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { books, totalItems } = await findBookWishlistService(
      userId,
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(books, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getWishlistByBookId: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const { bookId } = req.params;

    const wishlistFollow = await findOneBookWishlistService(bookId, userId);

    if (!wishlistFollow) {
      return createErrorResponse(res, "Not added book to wislist yet", 404);
    }

    createSuccessResponse(res, wishlistFollow);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteWishlistByBookId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookId } = req.params;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong when passing req user",
        403,
      );
    }

    const existingWishlist = await findOneBookWishlistService(bookId, userId);

    if (!existingWishlist) {
      return createErrorResponse(res, "Already remove book from wishlist", 400);
    }

    await deleteWishlistService(bookId, userId);
    await updateBookWishlistCountService(bookId, "decrement");

    createSuccessResponse(
      res,
      undefined,
      `Successfully remove book from wishlist with id ${bookId}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
