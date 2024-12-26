import { and, count, desc, eq, sql } from "drizzle-orm";

import db from "../../config/database.config";
import AuthorModel from "../authors/author.model";
import BookGenreModel from "../book-genre/book-genre.model";
import BookPictureModel from "../book-pictures/book-picture.model";
import BookModel from "../books/book.model";
import GenreModel from "../genres/genre.model";
import LanguageModel from "../languages/language.model";
import PublisherModel from "../publishers/publisher.model";
import UserModel from "../users/user.model";
import BookWishlistModel, {
  InsertBookWishlistDTO,
} from "./book-wishlist.model";

export const bookResponse = {
  id: BookModel.id,
  sellerId: BookModel.sellerId,
  title: BookModel.title,
  genres: sql`
  (
    SELECT json_agg(json_build_object('id', id, 'name', name))
    FROM (
      SELECT DISTINCT ${GenreModel.id} AS id, ${GenreModel.name} AS name
      FROM ${BookGenreModel}
      INNER JOIN ${GenreModel} ON ${BookGenreModel.genreId} = ${GenreModel.id}
      WHERE ${BookGenreModel.bookId} = ${BookModel.id}
    ) AS unique_genres
  )
`.as("genres"),
  bookPictures: sql`
(
  SELECT json_agg(json_build_object('id', id, 'url', url, 'isCover', isCover))
  FROM (
    SELECT DISTINCT ${BookPictureModel.id} AS id, ${BookPictureModel.url} AS url, ${BookPictureModel.isCover} AS isCover
    FROM ${BookPictureModel}
    WHERE ${BookPictureModel.bookId} = ${BookModel.id}
  ) AS unique_pictures
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
  createdAt: BookModel.createdAt,
  updatedAt: BookModel.updatedAt,
};

export const createWishlistService = async (
  wishlistFollowData: InsertBookWishlistDTO,
) => {
  return (
    await db.insert(BookWishlistModel).values(wishlistFollowData).returning()
  )[0];
};

export const findBookWishlistService = async (
  userId: string,
  limit: string,
  offset: number,
) => {
  // * Join dengan LanguageModel aja di total items
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(BookModel)
        .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
        .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
        .leftJoin(BookPictureModel, eq(BookModel.id, BookPictureModel.bookId))
        .leftJoin(AuthorModel, eq(BookModel.authorId, AuthorModel.id))
        .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
        .leftJoin(PublisherModel, eq(BookModel.publisherId, PublisherModel.id))
        .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
        .where(eq(BookWishlistModel.userId, userId))
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
    .where(eq(BookWishlistModel.userId, userId))
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

export const findOneBookWishlistService = async (
  bookId: string,
  userId: string,
) => {
  return (
    await db
      .select()
      .from(BookWishlistModel)
      .where(
        and(
          eq(BookWishlistModel.bookId, bookId),
          eq(BookWishlistModel.userId, userId),
        ),
      )
  )[0];
};

// * * Gak usah returning kali, soalnya kan delete
export const deleteWishlistService = async (bookId: string, userId: string) => {
  return await db
    .delete(BookWishlistModel)
    .where(
      and(
        eq(BookWishlistModel.bookId, bookId),
        eq(BookWishlistModel.userId, userId),
      ),
    );
};
