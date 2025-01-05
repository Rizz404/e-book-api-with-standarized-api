import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { addFilters } from "../../utils/query.utils";
import BookModel from "../books/book.model";
import { findBooksByFiltersService } from "../books/book.services";
import { findUserByIdService } from "../users/user.services";
import BookPictureModel, {
  InsertBookPictureDTO,
  SelectBookPictureDTO,
} from "./book-picture.model";
import {
  createBookPicturesService,
  deleteBookPictureService,
  findBookPictureByIdService,
  findBookPicturesByBookIdService,
} from "./book-picture.services";

// *==========*==========*==========POST==========*==========*==========*
export const addBookPictures: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookPicturesData: InsertBookPictureDTO[] = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const userBooks = await findBooksByFiltersService("10", 0, {
      sellerId: userId,
    });
    const userBookIds = userBooks.books.map((book) => book.id);

    const invalidBookIds = bookPicturesData
      .map((picture) => picture.bookId)
      .filter((bookId) => !userBookIds.includes(bookId));

    if (invalidBookIds.length > 0) {
      return createErrorResponse(
        res,
        `You do not own the following books: ${invalidBookIds.join(", ")}`,
        403,
      );
    }

    const newBookPicture = await createBookPicturesService(bookPicturesData);

    createSuccessResponse(
      res,
      newBookPicture,
      "BookPictures created successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getBookPicturesByBookId: RequestHandler = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectBookPictureDTO> & {
        page?: string;
        limit?: string;
      };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const { bookPictures, totalItems } = await findBookPicturesByBookIdService(
      bookId,
      limit,
      offset,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(
        bookPictures,
        currentPage,
        itemsPerPage,
        totalItems,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getBookPictureById: RequestHandler = async (req, res) => {
  try {
    const { bookPictureId } = req.params;

    const bookPicture = await findBookPictureByIdService(bookPictureId);

    if (!bookPicture) {
      return createErrorResponse(res, "BookPicture not found", 404);
    }

    createSuccessResponse(res, bookPicture);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteBookPictureById: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { bookPictureId } = req.params;

    if (!user) {
      return createErrorResponse(res, "User must login first", 401);
    }

    const currentUser = await findUserByIdService(user.id);

    if (!currentUser) {
      return createErrorResponse(res, "User not found", 404);
    }

    const existingBookPicture = await findBookPictureByIdService(bookPictureId);

    if (!existingBookPicture) {
      return createErrorResponse(res, "BookPicture not found", 404);
    }

    if (existingBookPicture.books?.sellerId !== currentUser.id) {
      return createErrorResponse(
        res,
        "You don't have permission to delete this book picture",
        404,
      );
    }

    const deletedBookPicture = await deleteBookPictureService(bookPictureId);

    if (!deletedBookPicture) {
      return createErrorResponse(
        res,
        "Something cause bookPicture not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted bookPicture with id ${deletedBookPicture.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
