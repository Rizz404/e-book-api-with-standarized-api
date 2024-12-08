import { faker } from "@faker-js/faker";
import {
  and,
  between,
  Column,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
  sql,
  SQLWrapper,
} from "drizzle-orm";

import db from "../../config/database.config";
import AuthorModel from "../authors/author.model";
import BookGenreModel from "../book-genre/book-genre.model";
import BookPictureModel from "../book-pictures/book-picture.model";
import BookModel, { InsertBookDTO, SelectBookDTO } from "../books/book.model";
import GenreModel from "../genres/genre.model";
import LanguageModel from "../languages/language.model";
import PublisherModel from "../publishers/publisher.model";
import UserModel from "../users/user.model";
import { findUserByIdService } from "../users/user.services";

export interface Filters {
  sellerId?: string;
  status?: "AVAILABLE" | "SOLD" | "ARCHIVED" | null;
  publicationDateRange?: { start: string; end: string };
  language?: string;
}

export const bookResponse = {
  id: BookModel.id,
  sellerId: BookModel.sellerId,
  title: BookModel.title,
  genres: sql`
      json_agg(
        json_build_object('id', ${GenreModel.id}, 'name', ${GenreModel.name})
      )
    `.as("genres"),
  bookPictures: sql`
      json_agg(
        json_build_object(
          'id', ${BookPictureModel.id},
          'url', ${BookPictureModel.url},
          'isCover', ${BookPictureModel.isCover}
        )
      )
    `.as("bookPictures"),
  description: BookModel.description,
  status: BookModel.status,
  slug: BookModel.slug,
  isbn: BookModel.isbn,
  stock: BookModel.stock,
  price: BookModel.price,
  fileUrl: BookModel.fileUrl,
  publicationDate: BookModel.publicationDate,
  author: {
    id: AuthorModel.id,
    name: AuthorModel.name,
  },
  seller: {
    id: UserModel.id,
    username: UserModel.username,
    email: UserModel.email,
    isVerified: UserModel.isVerified,
    profilePicture: UserModel.profilePicture,
  },
  publisher: {
    id: PublisherModel.id,
    name: PublisherModel.name,
    email: PublisherModel.email,
    website: PublisherModel.website,
  },
  language: LanguageModel.name,
};

export const createBookService = async (
  bookData: Omit<InsertBookDTO, "slug" | "isbn">,
) => {
  const { title, sellerId } = bookData;

  const seller = await findUserByIdService(sellerId);
  const generatedSlug = `seller_${seller.username}_${title.split(" ").join("_")}`;

  return (
    await db
      .insert(BookModel)
      .values({ ...bookData, slug: generatedSlug, isbn: faker.commerce.isbn() })
      .returning()
  )[0];
};

export const findBooksByFiltersService = async (
  limit: string,
  offset: number,
  filters?: Filters,
) => {
  const conditions: SQL<unknown>[] = [];

  if (filters?.status) {
    conditions.push(eq(BookModel.status, filters.status));
  }

  if (filters?.sellerId) {
    conditions.push(eq(UserModel.id, filters.sellerId));
  }

  if (filters?.publicationDateRange) {
    conditions.push(
      between(
        BookModel.publicationDate,
        filters.publicationDateRange.start,
        filters.publicationDateRange.end,
      ),
    );
  }

  if (filters?.language) {
    conditions.push(eq(LanguageModel.name, filters.language));
  }

  const filtersQuery = conditions.length > 0 ? and(...conditions) : undefined;

  // * Join dengan LanguageModel aja di total items
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(BookModel)
        .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
        .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
        .where(filtersQuery)
    )[0].count || 0;

  const books = await db
    .select(bookResponse)
    .from(BookModel)
    .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
    .leftJoin(BookPictureModel, eq(BookModel.id, BookPictureModel.bookId))
    .leftJoin(AuthorModel, eq(BookModel.authorId, AuthorModel.id))
    .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
    .leftJoin(PublisherModel, eq(BookModel.publisherId, PublisherModel.id))
    .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
    .where(filtersQuery)
    .groupBy(
      BookModel.id, // * Kelompokkin hindari duplikat
      AuthorModel.id,
      UserModel.id,
      PublisherModel.id,
      LanguageModel.name,
    )
    .orderBy(desc(BookModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, books };
};

export const findBooksLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(BookModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const books = await db
    .select(bookResponse)
    .from(BookModel)
    .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
    .leftJoin(BookPictureModel, eq(BookModel.id, BookPictureModel.bookId))
    .leftJoin(AuthorModel, eq(BookModel.authorId, AuthorModel.id))
    .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
    .leftJoin(PublisherModel, eq(BookModel.publisherId, PublisherModel.id))
    .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
    .where(ilike(column, `%${value}%`))
    .groupBy(
      BookModel.id, // * Kelompokkin hindari duplikat
      AuthorModel.id,
      UserModel.id,
      PublisherModel.id,
      LanguageModel.name,
    )
    .orderBy(desc(BookModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, books };
};

export const findBookByIdService = async (id: string) => {
  return (
    await db
      .select(bookResponse)
      .from(BookModel)
      .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
      .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
      .leftJoin(BookPictureModel, eq(BookModel.id, BookPictureModel.bookId))
      .leftJoin(AuthorModel, eq(BookModel.authorId, AuthorModel.id))
      .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
      .leftJoin(PublisherModel, eq(BookModel.publisherId, PublisherModel.id))
      .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
      .where(eq(BookModel.id, id))
      .groupBy(
        BookModel.id, // * Kelompokkin hindari duplikat
        AuthorModel.id,
        UserModel.id,
        PublisherModel.id,
        LanguageModel.name,
      )
      .limit(1)
  )[0];
};

export const findBookByColumnService = async <
  Column extends keyof SelectBookDTO,
>(
  column: Column,
  value: SelectBookDTO[Column], // Tipe data sesuai kolom
) => {
  return (
    await db
      .select(bookResponse)
      .from(BookModel)
      .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
      .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
      .leftJoin(BookPictureModel, eq(BookModel.id, BookPictureModel.bookId))
      .leftJoin(AuthorModel, eq(BookModel.authorId, AuthorModel.id))
      .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
      .leftJoin(PublisherModel, eq(BookModel.publisherId, PublisherModel.id))
      .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
      .where(eq(BookModel[column], value!))
      .groupBy(
        BookModel.id, // * Kelompokkin hindari duplikat
        AuthorModel.id,
        UserModel.id,
        PublisherModel.id,
        LanguageModel.name,
      )
      .limit(1)
  )[0];
};

export const updateBookService = async (
  bookId: string,
  sellerId: string,
  bookData: Partial<InsertBookDTO>,
) => {
  const {
    title,
    authorId,
    publisherId,
    languageId,
    description,
    publicationDate,
    isbn,
    price,
    stock,
    status,
    fileUrl,
  } = bookData;
  let newSlug: string | undefined;

  if (title) {
    const seller = await findUserByIdService(sellerId);
    const generatedSlug = `seller_${seller.username}_${title.split(" ").join("_")}`;

    newSlug = generatedSlug;
  }

  const updateData = {
    ...(title !== undefined && { title }),
    ...(authorId !== undefined && { authorId }),
    ...(publisherId !== undefined && { publisherId }),
    ...(languageId !== undefined && { languageId }),
    ...(description !== undefined && { description }),
    ...(publicationDate !== undefined && { publicationDate }),
    ...(title !== undefined && { slug: newSlug }),
    ...(isbn !== undefined && { isbn }),
    ...(price !== undefined && { price }),
    ...(stock !== undefined && { stock }),
    ...(status !== undefined && { status }),
    ...(fileUrl !== undefined && { fileUrl }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findBookByIdService(bookId);
  }

  return (
    await db
      .update(BookModel)
      .set(updateData)
      .where(eq(BookModel.id, bookId))
      .returning()
  )[0];
};

export const deleteBookService = async (bookId: string) => {
  return (
    await db.delete(BookModel).where(eq(BookModel.id, bookId)).returning()
  )[0];
};
