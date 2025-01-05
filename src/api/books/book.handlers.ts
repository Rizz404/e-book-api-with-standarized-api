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
import { findUserByIdService } from "../users/user.services";
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

// Definisi tipe untuk request files
interface CustomRequestFiles {
  fileUrl?: Express.Multer.File[];
  bookPictures?: Express.Multer.File[];
}

// Definisi tipe untuk request body
interface CreateBookRequestBody extends InsertBookDTO {
  bookGenreIds: string[];
  fileUrl?: string;
  bookPictures?: string | string[];
}
// *==========*==========*==========POST==========*==========*==========*
export const createBook: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const bookData = req.body as CreateBookRequestBody;
    const files = (req.files as CustomRequestFiles) || {};

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    if (bookData.bookGenreIds === null || bookData.bookGenreIds.length <= 0) {
      return createErrorResponse(res, "Genre is required", 400);
    }

    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    // * Handle fileUrl (PDF file)
    let fileUrl: string | undefined;
    if (bookData.fileUrl) {
      // * Jika client mengirim string URL
      fileUrl = bookData.fileUrl;
    } else if (files.fileUrl?.[0]?.cloudinary?.secure_url) {
      // * Jika client mengirim file
      fileUrl = files.fileUrl[0].cloudinary.secure_url;
    }

    // * Handle bookPictures
    const bookPictures: string[] = [];

    // * Tambahkan URL yang dikirim sebagai string
    if (bookData.bookPictures) {
      const stringPictures = Array.isArray(bookData.bookPictures)
        ? bookData.bookPictures
        : [bookData.bookPictures];
      bookPictures.push(...stringPictures);
    }

    // * Tambahkan URL dari file yang diupload
    if (files.bookPictures && files.bookPictures?.length > 0) {
      const uploadedPictureUrls = files.bookPictures
        .filter((file) => file.cloudinary?.secure_url)
        .map((file) => file.cloudinary!.secure_url);
      bookPictures.push(...uploadedPictureUrls);
    }

    // * Validasi jumlah gambar
    if (bookPictures.length > 7) {
      return createErrorResponse(res, "Maksimal 7 gambar diperbolehkan", 400);
    }

    // * Buat buku baru
    const newBook = await createBookService({
      ...bookData,
      fileUrl,
      sellerId: userId,
    });

    // * Simpan genre
    if (bookData.bookGenreIds?.length > 0) {
      await createBookGenresService(
        bookData.bookGenreIds.map((genreId) => ({
          bookId: newBook.id,
          genreId,
        })),
      );
    }

    // * Simpan gambar
    if (bookPictures.length > 0) {
      await createBookPicturesService(
        bookPictures.map((url) => ({
          bookId: newBook.id,
          url,
        })),
      );
    }

    createSuccessResponse(res, newBook, "Buku berhasil dibuat", 201);
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
    const user = req.user;
    const { bookId } = req.params;

    if (!user) {
      return createErrorResponse(res, "User must login first", 401);
    }

    const currentUser = await findUserByIdService(user.id);

    if (!currentUser) {
      return createErrorResponse(res, "User not found", 404);
    }

    const bookData: Partial<InsertBookDTO> = req.body;

    const existingBook = await findBookByIdService(bookId);

    if (!existingBook) {
      return createErrorResponse(res, "Book not found", 404);
    }

    if (
      existingBook.seller?.id !== currentUser.id &&
      currentUser.role !== "ADMIN"
    ) {
      return createErrorResponse(
        res,
        "You don't have permission to update this book",
        403,
      );
    }

    const updatedBook = await updateBookService(
      bookId,
      currentUser.id,
      bookData,
    );

    createSuccessResponse(res, updatedBook);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// *==========*==========*==========DELETE==========*==========*==========*
export const deleteBookById: RequestHandler = async (req, res) => {
  try {
    const user = req.user;
    const { bookId } = req.params;

    if (!user) {
      return createErrorResponse(res, "User must login first", 401);
    }

    const currentUser = await findUserByIdService(user.id);

    if (!currentUser) {
      return createErrorResponse(res, "User not found", 404);
    }
    const existingBook = await findBookByIdService(bookId);

    if (!existingBook) {
      return createErrorResponse(res, "Book not found", 404);
    }

    if (
      existingBook.seller?.id !== currentUser.id &&
      currentUser.role !== "ADMIN"
    ) {
      return createErrorResponse(
        res,
        "You don't have permission to update this book",
        403,
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
