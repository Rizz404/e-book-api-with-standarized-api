import { faker } from "@faker-js/faker";
import {
  Column,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
  SQLWrapper,
} from "drizzle-orm";

import db from "../../config/database-config";
import BookModel from "../books/book.model";
import UserModel from "../users/user.model";
import BookReviewModel, {
  InsertBookReviewDTO,
  SelectBookReviewDTO,
} from "./book.review.model";

export const createBookReviewService = async (
  bookReviewData: InsertBookReviewDTO,
) => {
  return (
    await db.insert(BookReviewModel).values(bookReviewData).returning()
  )[0];
};

export const findBookReviewsByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (
      await db.select({ count: count() }).from(BookReviewModel).where(filters)
    )[0].count || 0;
  const bookReviews = await db
    .select()
    .from(BookReviewModel)
    .leftJoin(UserModel, eq(BookReviewModel.userId, UserModel.id))
    .leftJoin(BookModel, eq(BookReviewModel.bookId, BookModel.id))
    .where(filters)
    .orderBy(desc(BookReviewModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, bookReviews };
};

export const findBookReviewByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(BookReviewModel)
      .leftJoin(UserModel, eq(BookReviewModel.userId, UserModel.id))
      .leftJoin(BookModel, eq(BookReviewModel.bookId, BookModel.id))
      .where(eq(BookReviewModel.id, id))
      .limit(1)
  )[0];
};

export const findBookReviewByColumnService = async <
  Column extends keyof SelectBookReviewDTO,
>(
  column: Column,
  value: SelectBookReviewDTO[Column], // Tipe data sesuai kolom
) => {
  return (
    await db
      .select()
      .from(BookReviewModel)
      .leftJoin(UserModel, eq(BookReviewModel.userId, UserModel.id))
      .leftJoin(BookModel, eq(BookReviewModel.bookId, BookModel.id))
      .where(eq(BookReviewModel[column], value!))
      .limit(1)
  )[0];
};

export const updateBookReviewService = async (
  bookReviewId: string,
  userId: string,
  bookReviewData: Partial<InsertBookReviewDTO>,
) => {
  const { comment, rating } = bookReviewData;

  const updateData = {
    ...(comment !== undefined && { comment }),
    ...(rating !== undefined && { rating }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findBookReviewByIdService(bookReviewId);
  }

  return (
    await db
      .update(BookReviewModel)
      .set(updateData)
      .where(eq(BookReviewModel.id, bookReviewId))
      .returning()
  )[0];
};

export const deleteBookReviewService = async (bookReviewId: string) => {
  return (
    await db
      .delete(BookReviewModel)
      .where(eq(BookReviewModel.id, bookReviewId))
      .returning()
  )[0];
};
