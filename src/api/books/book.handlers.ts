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
      bookGenreIds: string[];
    } = req.body;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    // * Cek file dari req.files
    const files = req.files as {
      fileUrl?: Express.Multer.File[];
      bookPictureString?: Express.Multer.File[];
    };

    // * Handle fileUrl (bisa string atau file)
    let fileUrl: string | undefined;

    if (req.body.fileUrl) {
      // * Jika fileUrl dikirim sebagai string
      fileUrl = req.body.fileUrl;
    } else if (files.fileUrl && files.fileUrl.length > 0) {
      // * Jika fileUrl di-upload sebagai file
      fileUrl = files.fileUrl[0].cloudinary?.secure_url; // URL dari Cloudinary
    }

    // * Validasi fileUrl
    if (!fileUrl) {
      return createErrorResponse(res, "No fileUrl provided", 400);
    }

    // * Handle bookPictureString (bisa string array atau file array)
    const bookPictures: string[] = [];

    // * Tambahkan gambar dari req.body (jika dikirim sebagai string)
    if (req.body.bookPictureString) {
      const stringPictures = Array.isArray(req.body.bookPictureString)
        ? req.body.bookPictureString
        : [req.body.bookPictureString];
      bookPictures.push(...stringPictures);
    }

    // * Tambahkan gambar dari file upload
    if (files.bookPictureString && files.bookPictureString.length > 0) {
      files.bookPictureString.forEach((file) => {
        if (file.cloudinary) {
          bookPictures.push(file.cloudinary.secure_url);
        }
      });
    }

    // * Validasi jumlah gambar
    if (bookPictures.length > 10) {
      return createErrorResponse(res, "Max pictures is 10", 400);
    }

    // * Simpan data buku ke database
    const newBook = await createBookService({
      ...bookData,
      fileUrl, // * Masukkan URL file
      sellerId: userId,
    });

    // * Simpan gambar terkait buku
    if (bookPictures.length > 0) {
      const bookPictureDTOs: SelectBookPictureDTO[] = bookPictures.map(
        (url) => ({
          bookId: newBook.id,
          url,
        }),
      );
      await createBookPicturesService(bookPictureDTOs);
    }

    // * Respon berhasil
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
