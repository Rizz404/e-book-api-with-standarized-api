import { count, desc, eq, sql } from "drizzle-orm";

import db from "../../config/database.config";
import BookModel from "../books/book.model";
import BookPictureModel, { SelectBookPictureDTO } from "./book-picture.model";

export const createBookPicturesService = async (
  bookPictureData: SelectBookPictureDTO[],
) => {
  return await db.insert(BookPictureModel).values(bookPictureData).returning();
};

const bookPictureResponse = {
  id: BookPictureModel.id,
  bookId: BookPictureModel.bookId,
  url: BookPictureModel.url,
  isCover: BookPictureModel.isCover,
  createdAt: BookPictureModel.createdAt,
  updatedAt: BookPictureModel.updatedAt,
  book: {
    sellerId: BookModel.sellerId,
  },
};

export const findBookPicturesByBookIdService = async (
  bookId: string,
  limit: string,
  offset: number,
) => {
  const totalItems =
    (
      await db
        .select({ count: sql`COUNT(DISTINCT ${BookPictureModel.id})` })
        .from(BookPictureModel)
        .where(eq(BookPictureModel.bookId, bookId))
    )[0].count || 0;
  const bookPictures = await db
    .select(bookPictureResponse)
    .from(BookPictureModel)
    .leftJoin(BookModel, eq(BookPictureModel.bookId, BookModel.id))
    .where(eq(BookPictureModel.bookId, bookId))
    .orderBy(desc(BookPictureModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems: +totalItems, bookPictures };
};

export const findBookPictureByIdService = async (id: string) => {
  return (
    await db
      .select(bookPictureResponse)
      .from(BookPictureModel)
      .leftJoin(BookModel, eq(BookPictureModel.bookId, BookModel.id))
      .where(eq(BookPictureModel.id, id))
      .limit(1)
  )[0];
};

export const findBookPictureByColumnService = async <
  Column extends keyof SelectBookPictureDTO,
>(
  column: Column,
  value: SelectBookPictureDTO[Column],
) => {
  return (
    await db
      .select(bookPictureResponse)
      .from(BookPictureModel)
      .leftJoin(BookModel, eq(BookPictureModel.bookId, BookModel.id))
      .where(eq(BookPictureModel[column], value!))
      .limit(1)
  )[0];
};

export const deleteBookPictureService = async (bookPictureId: string) => {
  return (
    await db
      .delete(BookPictureModel)
      .where(eq(BookPictureModel.id, bookPictureId))
      .returning()
  )[0];
};
