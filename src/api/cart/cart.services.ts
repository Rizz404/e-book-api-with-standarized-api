import { Column, count, desc, eq, ilike, SQL, SQLWrapper } from "drizzle-orm";

import db from "../../config/database.config";
import CartModel, { InsertCartDTO, SelectCartDTO } from "../cart/cart.model";
import { SelectCartItemDTO } from "../cart-items/cart-item.model";
import OrderModel from "../orders/order.model";
import PaymentMethodModel from "../payment-methods/payment-method.model";
import ShippingServiceModel from "../shipping-services/shipping-service.model";
import TransactionModel from "../transactions/transaction.model";
import UserModel from "../users/user.model";

export const createCartService = async (cartData: InsertCartDTO) => {
  return (await db.insert(CartModel).values(cartData).returning())[0];
};

export const cartCheckoutService = async (
  userId: string,
  cartItems: (SelectCartItemDTO & { shippingServiceId: string })[],
  paymentMethodId: string,
) => {
  return await db.transaction(async (tx) => {
    for (const cartItem of cartItems) {
      const { bookId, priceAtCart, quantity, shippingServiceId } = cartItem;

      const [shippingService] = await tx
        .select()
        .from(ShippingServiceModel)
        .where(eq(ShippingServiceModel.id, shippingServiceId))
        .limit(1);

      const [paymentMethod] = await tx
        .select()
        .from(PaymentMethodModel)
        .where(eq(PaymentMethodModel.id, paymentMethodId))
        .limit(1);

      const subtotalPrice = priceAtCart * quantity;
      const adminFee = 2500;
      const discount = 0;
      const totalPrice = subtotalPrice + adminFee - discount * 100;

      const [createTransaction] = await tx
        .insert(TransactionModel)
        .values({
          userId,
          totalShippingServicesFee: shippingService.price,
          adminFee,
          discount,
          paymentMethodFee: paymentMethod.price,
          paymentReference: paymentMethod.name,
          subtotalPrice,
          totalPrice,
        })
        .returning();

      const [createOrder] = await tx
        .insert(OrderModel)
        .values({
          userId,
          bookId,
          quantity,
          shippingServiceId,
          transactionId: createTransaction.id,
          totalPrice,
          priceSold: priceAtCart,
        })
        .returning();

      return createOrder;
    }
  });
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
