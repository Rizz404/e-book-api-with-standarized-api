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

// *==========*==========*==========POST==========*==========*==========*
export const createBook: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookData: InsertBookDTO & {
      bookGenres: InsertBookGenreDTO[];
      bookPictures: InsertBookPictureDTO[];
    } = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const book = await findBookByColumnService("slug", bookData.slug);

    if (book) {
      return createErrorResponse(res, "Book already exist", 400);
    }

    const newBook = await createBookService({
      authorId: bookData.authorId,
      description: bookData.description,
      publisherId: bookData.publisherId,
      languageId: bookData.languageId,
      title: bookData.title,
      publicationDate: bookData.publicationDate,
      fileUrl: bookData.fileUrl,
      sellerId: userId,
      price: bookData.price,
      stock: bookData.stock,
    });

    if (bookData.bookGenres.length >= 12) {
      return createErrorResponse(res, "Max genres is 12", 400);
    }

    if (bookData.bookPictures.length >= 10) {
      return createErrorResponse(res, "Max pictures is 10", 400);
    }

    if (newBook) {
      const bookGenres: InsertBookGenreDTO[] = bookData.bookGenres.map(
        (genre) => ({
          bookId: newBook.id,
          genreId: genre.genreId,
        }),
      );
      const bookPictures: SelectBookPictureDTO[] = bookData.bookPictures.map(
        (bookPicture) => ({
          url: bookPicture.url,
          isCover: bookPicture.isCover || false,
          bookId: newBook.id,
        }),
      );

      if (bookData.bookGenres.length > 0) {
        await createBookGenresService(bookGenres);
      }
      if (bookData.bookPictures.length > 0) {
        await createBookPicturesService(bookPictures);
      }
    }

    createSuccessResponse(res, newBook, "Book created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========GET==========*==========*==========*
export const getBooks: RequestHandler = async (req, res) => {
  try {
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
    const { bookId } = req.params;

    const book = await findBookByIdService(bookId);

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
