import { eq } from "drizzle-orm";
import { RequestHandler } from "express";

import { parsePagination } from "../../utils/api-request.utils";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../../utils/api-response.utils";
import { addFilters } from "../../utils/query.utils";
import { InsertBookGenreDTO } from "../book-genre/book-genre.model";
import { createBookGenresService } from "../book-genre/book-genre.services";
import {
  InsertBookPictureDTO,
  SelectBookPictureDTO,
} from "../book-pictures/book-picture.model";
import { createBookPicturesService } from "../book-pictures/book-picture.services";
import BookModel, { InsertBookDTO, SelectBookDTO } from "./book.model";
import {
  createBookService,
  deleteBookService,
  findBookByColumnService,
  findBookByIdService,
  findBooksByFiltersService,
  findBooksLikeColumnService,
  updateBookService,
} from "./book.services";

interface CustomRequestFiles {
  fileUrl?: Express.Multer.File[];
  bookPictures?: Express.Multer.File[];
}

// *==========*==========*==========POST==========*==========*==========*
export const createBook: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookData: InsertBookDTO & {
      bookGenreIds: string[];
      bookPictures: string[];
    } = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    const files = (req.files as CustomRequestFiles) || {};

    let fileUrl: string | undefined;

    if (bookData.fileUrl) {
      fileUrl = bookData.fileUrl;
    } else if (files.fileUrl && files.fileUrl.length > 0) {
      fileUrl = files.fileUrl[0]?.cloudinary?.secure_url;
    }

    const bookPictures: string[] = [];

    if (bookData.bookPictures) {
      const stringPictures = Array.isArray(bookData.bookPictures)
        ? bookData.bookPictures
        : [bookData.bookPictures];
      bookPictures.push(...stringPictures);
    }

    if (files.bookPictures && files.bookPictures.length > 0) {
      files.bookPictures.forEach((file) => {
        if (file.cloudinary) {
          bookPictures.push(file.cloudinary.secure_url);
        }
      });
    }

    if (bookPictures.length > 7) {
      return createErrorResponse(res, "Max pictures is 7", 400);
    }

    const newBook = await createBookService({
      ...bookData,
      fileUrl,
      sellerId: userId,
    });

    if (bookPictures.length > 0) {
      const bookPictureDTOs: SelectBookPictureDTO[] = bookPictures.map(
        (url) => ({
          bookId: newBook.id,
          url,
        }),
      );
      await createBookPicturesService(bookPictureDTOs);
    }

    createSuccessResponse(res, newBook, "Book created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getBooks: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id; // * Buat denormalisasi
    // * Udah ada otomatis dari dto buat object yang kaga ada typenya
    const {
      page = "1",
      limit = "10",
      status,
      sellerId,
      genreId,
      authorId,
      publisherId,
      publicationDateRange,
      language,
    } = req.query as unknown as Partial<SelectBookDTO> & {
      page?: string;
      limit?: string;
      genreId?: string;
      publicationDateRange?: string;
      language?: string;
    };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const publicationDateRangeFilter = publicationDateRange
      ? (() => {
          const [start, end] = publicationDateRange.split(",");
          return { start, end };
        })()
      : undefined;

    const { books, totalItems } = await findBooksByFiltersService(
      limit,
      offset,
      {
        status,
        sellerId,
        genreId,
        authorId,
        publisherId,
        publicationDateRange: publicationDateRangeFilter,
        language,
      },
      userId,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(books, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getBooksLikeColumn: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id; // * Buat denormalisasi
    const {
      page = "1",
      limit = "10",
      title = "",
      slug = "",
    } = req.query as unknown as Partial<SelectBookDTO> & {
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
    const { books, totalItems } = await findBooksLikeColumnService(
      limit,
      offset,
      title ? BookModel.title : BookModel.slug,
      title || slug,
      userId,
    );

    createSuccessResponse(
      res,
      createPaginatedResponse(books, currentPage, itemsPerPage, totalItems),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getBookById: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id; // * Buat denormalisasi
    const { bookId } = req.params;

    const book = await findBookByIdService(bookId, userId);

    if (!book) {
      return createErrorResponse(res, "Book not found", 404);
    }

    createSuccessResponse(res, book);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========PATCH==========*==========*==========*
export const updateBookById: RequestHandler = async (req, res) => {
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

    const { bookId } = req.params;
    const bookData: Partial<InsertBookDTO> = req.body;

    const existingBook = await findBookByIdService(bookId);

    console.log(`userId: ${userId}`);
    console.log(`sellerId: ${existingBook.seller?.id}`);
    console.log(`role: ${role}`);

    if (!existingBook) {
      return createErrorResponse(res, "Book not found", 404);
    }

    if (existingBook.seller?.id !== userId && role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to update this book",
        404,
      );
    }

    const updatedBook = await updateBookService(bookId, userId, bookData);

    createSuccessResponse(res, updatedBook);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteBookById: RequestHandler = async (req, res) => {
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

    const { bookId } = req.params;

    const existingBook = await findBookByIdService(bookId);

    if (!existingBook) {
      return createErrorResponse(res, "Book not found", 404);
    }

    if (existingBook.seller?.id !== userId && role !== "ADMIN") {
      return createErrorResponse(
        res,
        "You don't have permission to delete this book",
        404,
      );
    }

    const deletedBook = await deleteBookService(bookId);

    if (!deletedBook) {
      return createErrorResponse(
        res,
        "Something cause book not deleted properly",
        400,
      );
    }

    createSuccessResponse(
      res,
      undefined,
      `Successfully deleted book with id ${deletedBook.id}`,
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};
