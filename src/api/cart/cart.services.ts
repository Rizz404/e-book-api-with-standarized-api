import { count, desc, eq, inArray, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

import db from "../../config/database.config";
import BookModel from "../books/book.model";
import CartModel, { InsertCartDTO, SelectCartDTO } from "../cart/cart.model";
import CartItemModel, {
  SelectCartItemDTO,
} from "../cart-items/cart-item.model";
import OrderModel from "../orders/order.model";
import PaymentMethodModel from "../payment-methods/payment-method.model";
import ShippingServiceModel from "../shipping-services/shipping-service.model";
import TransactionModel from "../transactions/transaction.model";
import UserModel from "../users/user.model";

export interface ICartCheckoutServiceParams {
  cartItemId: string;
  shippingServiceId: string;
}

interface IOrderData {
  userId: string;
  bookId: string;
  quantity: number;
  shippingServiceId: string;
  transactionId: string;
  totalPrice: number;
  priceSold: number;
}

export const createCartService = async (cartData: InsertCartDTO) => {
  return (await db.insert(CartModel).values(cartData).returning())[0];
};

export const cartCheckoutService = async (
  userId: string,
  cartCheckoutItems: ICartCheckoutServiceParams[],
  paymentMethodId: string,
) => {
  return await db.transaction(async (tx) => {
    const cartItemIds = cartCheckoutItems.map(
      (cartCheckoutItem) => cartCheckoutItem.cartItemId,
    );
    const shippingServiceIds = cartCheckoutItems.map(
      (cartCheckoutItem) => cartCheckoutItem.shippingServiceId,
    );

    const cartItems = await tx
      .select()
      .from(CartItemModel)
      .where(inArray(CartItemModel.id, cartItemIds));

    console.log(`cartItems ${cartItems}`);

    const shippingServices = await tx
      .select()
      .from(ShippingServiceModel)
      .where(inArray(ShippingServiceModel.id, shippingServiceIds));

    console.log(
      "Shipping Services:",
      JSON.stringify(shippingServices, null, 2),
    );

    shippingServices.forEach((service) => {
      console.log(
        `Shipping Service ID: ${service.id}, Price: ${service.price}`,
      );
    });

    const [paymentMethod] = await tx
      .select()
      .from(PaymentMethodModel)
      .where(eq(PaymentMethodModel.id, paymentMethodId));

    console.log(`paymentMethod ${paymentMethod}`);

    if (!paymentMethod) {
      tx.rollback();
      throw new Error("Invalid payment method");
    }

    let subtotalPrice = 0;
    let totalShippingServicesFee = 0;
    const adminFee = 2500;
    const discount = 0;

    const ordersData: IOrderData[] = cartItems.map((cartItem) => {
      const shippingService = shippingServices.find(
        (ss) =>
          ss.id ===
          cartCheckoutItems.find((ci) => ci.cartItemId === cartItem.id)
            ?.shippingServiceId,
      );

      if (!shippingService) {
        tx.rollback();
        throw new Error("Invalid shipping service");
      }

      subtotalPrice += Number(cartItem.priceAtCart) * Number(cartItem.quantity);
      totalShippingServicesFee += Number(shippingService.price);

      return {
        userId,
        bookId: cartItem.bookId,
        quantity: cartItem.quantity,
        shippingServiceId: shippingService.id,
        transactionId: "", // * Diperbarui setelah transaksi dibuat
        totalPrice:
          Number(cartItem.priceAtCart) * Number(cartItem.quantity) +
          Number(shippingService.price),
        priceSold: Number(cartItem.priceAtCart),
      };
    });

    const totalPrice =
      subtotalPrice + totalShippingServicesFee + adminFee - discount;

    const [transaction] = await tx
      .insert(TransactionModel)
      .values({
        userId,
        totalShippingServicesFee,
        adminFee,
        discount,
        paymentMethodFee: paymentMethod.price,
        paymentReference: paymentMethod.name,
        subtotalPrice,
        totalPrice,
      })
      .returning();

    // * Perbarui transactionId di orders
    ordersData.forEach((order) => {
      order.transactionId = transaction.id;
    });

    const orders = await tx.insert(OrderModel).values(ordersData).returning();

    const bookUpdates = cartItems.map((cartItem) => ({
      bookId: cartItem.bookId,
      quantity: cartItem.quantity,
    }));

    for (const book of bookUpdates) {
      await tx
        .update(BookModel)
        .set({ stock: sql`${BookModel.stock} - ${book.quantity}` })
        .where(eq(BookModel.id, book.bookId));
    }

    // * Hapus semua cart items yang di-checkout
    await tx
      .delete(CartItemModel)
      .where(inArray(CartItemModel.id, cartItemIds));

    return { transaction, orders };
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
