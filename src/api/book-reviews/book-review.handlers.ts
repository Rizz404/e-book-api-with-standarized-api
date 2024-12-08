import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { addFilters } from "../../utils/query.utils";
import BookReviewModel, {
  InsertBookReviewDTO,
  SelectBookReviewDTO,
} from "./book-review.model";
import {
  createBookReviewService,
  deleteBookReviewService,
  findBookReviewByColumnService,
  findBookReviewByIdService,
  findBookReviewsByFiltersService,
  updateBookReviewService,
} from "./book-review.services";

// *==========*==========*==========POST==========*==========*==========*
export const createBookReview: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const bookReviewData: InsertBookReviewDTO = req.body;

    const newBookReview = await createBookReviewService({
      ...bookReviewData,
      userId,
    });

    createSuccessResponse(
      res,
      newBookReview,
      "BookReview created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getBookReviews: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      rating,
    } = req.query as unknown as Partial<SelectBookReviewDTO> & {
      page?: string;
      limit?: string;
    };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    // * Filter
    const filters = addFilters(BookReviewModel, [
      rating ? (table) => eq(table.rating, rating) : undefined,
    ]);

    const { bookReviews, totalItems } = await findBookReviewsByFiltersService(
      limit,
      offset,
      filters,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        bookReviews,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getBookReviewById: RequestHandler = async (req, res) => {
  try {
    const { bookReviewId } = req.params;

    const bookReview = await findBookReviewByIdService(bookReviewId);

    if (!bookReview) {
      return createErrorResponse(res, "BookReview not found", 404);
    }

    createSuccessResponse(res, bookReview);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateBookReviewById: RequestHandler = async (req, res) => {
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

    const { bookReviewId } = req.params;
    const bookReviewData: Partial<InsertBookReviewDTO> = req.body;

    const existingBookReview = await findBookReviewByIdService(bookReviewId);

    if (!existingBookReview) {
      return createErrorResponse(res, "BookReview not found", 404);
    }

    if (existingBookReview.book_reviews.userId !== userId && role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to update this bookReview",
        404,
      );
    }

    const updatedBookReview = await updateBookReviewService(
      bookReviewId,
      userId,
      bookReviewData,
    );

    createSuccessResponse(res, updatedBookReview);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteBookReviewById: RequestHandler = async (req, res) => {
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

    const { bookReviewId } = req.params;

    const existingBookReview = await findBookReviewByIdService(bookReviewId);

    if (!existingBookReview) {
      return createErrorResponse(res, "BookReview not found", 404);
    }

    if (existingBookReview.book_reviews.userId !== userId && role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to delete this bookReview",
        404,
      );
    }

    const deletedBookReview = await deleteBookReviewService(bookReviewId);

    if (!deletedBookReview) {
      return createErrorResponse(
        res,
        "Something cause bookReview not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted bookReview with id ${deletedBookReview.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
