import { faker } from "@faker-js/faker";
import { Column, count, desc, eq, ilike, SQL, SQLWrapper } from "drizzle-orm";
import { sql } from "drizzle-orm";

import db from "../../config/database.config";
import BookModel from "../books/book.model";
import { findBookByIdService } from "../books/book.services";
import CartItemModel, {
  InsertCartItemDTO,
  SelectCartItemDTO,
} from "../cart-items/cart-item.model";

const cartItemResponse = {
  id: CartItemModel.id,
  cartId: CartItemModel.cartId,
  bookId: CartItemModel.bookId,
  priceAtCart: CartItemModel.priceAtCart,
  quantity: CartItemModel.quantity,
  createdAt: CartItemModel.createdAt,
  updatedAt: CartItemModel.updatedAt,
  book: {
    title: BookModel.title,
    description: BookModel.description,
    stock: BookModel.stock,
    price: BookModel.price,
  },
};

export const createCartItemService = async (
  cartItemData: InsertCartItemDTO,
) => {
  const book = await findBookByIdService(cartItemData.bookId);

  return (
    await db
      .insert(CartItemModel)
      .values({ ...cartItemData, priceAtCart: book.price })
      .returning()
      .onConflictDoUpdate({
        target: [CartItemModel.cartId, CartItemModel.bookId],
        set: {
          quantity: sql`${CartItemModel.quantity} + ${cartItemData.quantity}`,
          priceAtCart: book.price,
        },
      })
  )[0];
};

export const findCartItemsByCartId = async (
  cartId: string,
  limit: string,
  offset: number,
) => {
  const totalItems =
    (
      await db
        .select({ count: sql`COUNT(DISTINCT ${CartItemModel.id})` })
        .from(CartItemModel)
        .where(eq(CartItemModel.cartId, cartId))
    )[0].count || 0;
  const cartItems = await db
    .select(cartItemResponse)
    .from(CartItemModel)
    .leftJoin(BookModel, eq(CartItemModel.bookId, BookModel.id))
    .where(eq(CartItemModel.cartId, cartId))
    .orderBy(desc(CartItemModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems: +totalItems, cartItems };
};

export const findCartItemsLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(CartItemModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const cartItems = await db
    .select(cartItemResponse)
    .from(CartItemModel)
    .leftJoin(BookModel, eq(CartItemModel.bookId, BookModel.id))
    .where(ilike(column, `%${value}%`))
    .orderBy(desc(CartItemModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, cartItems };
};

export const findCartItemByIdService = async (id: string) => {
  return (
    await db
      .select(cartItemResponse)
      .from(CartItemModel)
      .leftJoin(BookModel, eq(CartItemModel.bookId, BookModel.id))
      .where(eq(CartItemModel.id, id))
      .limit(1)
  )[0];
};

export const findCartItemByColumnService = async <
  Column extends keyof SelectCartItemDTO,
>(
  column: Column,
  value: SelectCartItemDTO[Column], // Tipe data sesuai kolom
) => {
  return (
    await db
      .select(cartItemResponse)
      .from(CartItemModel)
      .leftJoin(BookModel, eq(CartItemModel.bookId, BookModel.id))
      .where(eq(CartItemModel[column], value!))
      .limit(1)
  )[0];
};

export const updateCartItemService = async (
  cartItemId: string,
  cartItemData: Partial<InsertCartItemDTO>,
) => {
  const { quantity, priceAtCart } = cartItemData;

  const updateData = {
    ...(quantity !== undefined && { quantity }),
    ...(priceAtCart !== undefined && { priceAtCart }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findCartItemByIdService(cartItemId);
  }

  return (
    await db
      .update(CartItemModel)
      .set(updateData)
      .where(eq(CartItemModel.id, cartItemId))
      .returning()
  )[0];
};

export const deleteCartItemService = async (cartItemId: string) => {
  return (
    await db
      .delete(CartItemModel)
      .where(eq(CartItemModel.id, cartItemId))
      .returning()
  )[0];
};
