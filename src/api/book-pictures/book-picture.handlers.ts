import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import {
  deleteCloudinaryImage,
  isCloudinaryUrl,
  isValidUrl,
} from "../../utils/cloudinary-utils";
import { addFilters } from "../../utils/query.utils";
import BookModel from "../books/book.model";
import {
  findBookByIdService,
  findBooksByFiltersService,
} from "../books/book.services";
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

interface CustomRequestFiles {
  bookPictures?: Express.Multer.File[];
}

// * *==========*==========*==========POST==========*==========*==========*
export const addBookPictures: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      bookId,
      bookPictures: bookPictureUrls = [],
    }: {
      bookId: string;
      bookPictures?: string[];
    } = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const book = await findBookByIdService(bookId);

    if (!book) {
      return createErrorResponse(res, "Book not found", 404);
    }

    if (book.sellerId !== userId) {
      return createErrorResponse(
        res,
        "You don't have permission to add book pictures",
        403,
      );
    }

    // * Get existing pictures count
    const { bookPictures: existingPictures } =
      await findBookPicturesByBookIdService(bookId, "100", 0);

    // * Collect all URLs (from both uploaded files and provided URLs)
    const newPictureUrls: string[] = [];

    // * Handle uploaded files
    const files = (req.files as CustomRequestFiles)?.bookPictures || [];
    files.forEach((file) => {
      if (file.cloudinary?.secure_url) {
        newPictureUrls.push(file.cloudinary.secure_url);
      }
    });

    // * Handle provided URLs
    bookPictureUrls.forEach((url) => {
      if (isValidUrl(url)) {
        newPictureUrls.push(url);
      }
    });

    // * Check total pictures limit
    const totalPictures = existingPictures.length + newPictureUrls.length;
    if (totalPictures > 7) {
      // * Delete uploaded pictures if limit exceeded
      for (const url of newPictureUrls) {
        if (isCloudinaryUrl(url)) {
          await deleteCloudinaryImage(url);
        }
      }
      return createErrorResponse(
        res,
        "Maximum 7 pictures allowed per book",
        400,
      );
    }

    // * Create book pictures
    const bookPictureDtos = newPictureUrls.map((url) => ({
      bookId,
      url,
    }));

    const newBookPictures = await createBookPicturesService(bookPictureDtos);

    createSuccessResponse(
      res,
      newBookPictures,
      "Book pictures added successfully",
      201,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// * *==========*==========*==========GET==========*==========*==========*
export const getBookPicturesByBookId: RequestHandler = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = "1", limit = "10" } =
      req.query as unknown as Partial<SelectBookPictureDTO> & {
        page?: string;
        limit?: string;
      };

    // * * Validasi dan parsing `page` dan `limit` pake function
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

// * *==========*==========*==========PATCH==========*==========*==========*

// * *==========*==========*==========DELETE==========*==========*==========*
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
      return createErrorResponse(res, "Book picture not found", 404);
    }

    if (existingBookPicture.book?.sellerId !== currentUser.id) {
      return createErrorResponse(
        res,
        "You don't have permission to delete this book picture",
        403,
      );
    }

    // * Check if this is the last picture
    const { bookPictures } = await findBookPicturesByBookIdService(
      existingBookPicture.bookId,
      "100",
      0,
    );

    if (bookPictures.length <= 1) {
      return createErrorResponse(
        res,
        "Cannot delete the last picture. Book must have at least one picture",
        400,
      );
    }

    // * Delete from Cloudinary if it's a Cloudinary image
    if (isCloudinaryUrl(existingBookPicture.url)) {
      try {
        await deleteCloudinaryImage(existingBookPicture.url);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // * Continue with deletion from database even if Cloudinary deletion fails
      }
    }

    const deletedBookPicture = await deleteBookPictureService(bookPictureId);

    if (!deletedBookPicture) {
      return createErrorResponse(
        res,
        "Something caused book picture not to be deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted book picture with id ${deletedBookPicture.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
