import { Column, count, desc, eq, ilike, SQL, SQLWrapper } from "drizzle-orm";

import db from "../../config/database-config";
import CartModel, { InsertCartDTO, SelectCartDTO } from "../cart/cart.model";
import UserModel from "../users/user.model";

export const createCartService = async (cartData: InsertCartDTO) => {
  return (await db.insert(CartModel).values(cartData).returning())[0];
};

export const findCartsByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (await db.select({ count: count() }).from(CartModel).where(filters))[0]
      .count || 0;
  const carts = await db
    .select()
    .from(CartModel)
    .leftJoin(UserModel, eq(CartModel.userId, UserModel.id))
    .where(filters)
    .orderBy(desc(CartModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, carts };
};

export const findCartByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(CartModel)
      .leftJoin(UserModel, eq(CartModel.userId, UserModel.id))
      .where(eq(CartModel.id, id))
      .limit(1)
  )[0];
};

export const findCartByColumnService = async <
  Column extends keyof SelectCartDTO,
>(
  column: Column,
  value: SelectCartDTO[Column], // Tipe data sesuai kolom
) => {
  return (
    await db
      .select()
      .from(CartModel)
      .leftJoin(UserModel, eq(CartModel.userId, UserModel.id))
      .where(eq(CartModel[column], value!))
      .limit(1)
  )[0];
};

export const deleteCartService = async (cartId: string) => {
  return (
    await db.delete(CartModel).where(eq(CartModel.id, cartId)).returning()
  )[0];
};
