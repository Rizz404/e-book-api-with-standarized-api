import { and, count, desc, eq, sql } from "drizzle-orm";

import db from "../../config/database.config";
import AuthorModel from "../authors/author.model";
import BookGenreModel from "../book-genre/book-genre.model";
import BookPictureModel from "../book-pictures/book-picture.model";
import BookModel from "../books/book.model";
import { bookResponse, getIsWishlisted } from "../books/book.services";
import GenreModel from "../genres/genre.model";
import LanguageModel from "../languages/language.model";
import PublisherModel from "../publishers/publisher.model";
import UserModel from "../users/user.model";
import BookWishlistModel, {
  InsertBookWishlistDTO,
} from "./book-wishlist.model";

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
        .select({ count: sql`COUNT(DISTINCT ${BookModel.id})` })
        .from(BookModel)
        .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
        .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
        .leftJoin(BookWishlistModel, eq(BookModel.id, BookWishlistModel.bookId))
        .leftJoin(BookPictureModel, eq(BookModel.id, BookPictureModel.bookId))
        .leftJoin(AuthorModel, eq(BookModel.authorId, AuthorModel.id))
        .leftJoin(UserModel, eq(BookModel.sellerId, UserModel.id))
        .leftJoin(PublisherModel, eq(BookModel.publisherId, PublisherModel.id))
        .leftJoin(LanguageModel, eq(BookModel.languageId, LanguageModel.id))
        .where(eq(BookWishlistModel.userId, userId))
    )[0].count || 0;

  const books = await db
    .select({
      ...bookResponse,
      ...getIsWishlisted(userId),
    })
    .from(BookModel)
    .leftJoin(BookGenreModel, eq(BookModel.id, BookGenreModel.bookId)) // * Join ke tabel pivot
    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id)) // * Join ke tabel genre    .leftJoin(GenreModel, eq(BookGenreModel.genreId, GenreModel.id))
    .leftJoin(BookWishlistModel, eq(BookModel.id, BookWishlistModel.bookId))
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

  return { totalItems: +totalItems, books };
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
