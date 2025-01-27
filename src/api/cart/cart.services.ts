import { count, desc, eq, inArray, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

import db from "../../config/database.config";
import { xenditInvoiceClient } from "../../config/xendit-config";
import BookModel from "../books/book.model";
import CartModel, { InsertCartDTO, SelectCartDTO } from "../cart/cart.model";
import { CartItemResponse } from "../cart-items/cart_item.types";
import CartItemModel from "../cart-items/cart-item.model";
import { cartItemResponse } from "../cart-items/cart-item.services";
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
  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(UserModel)
        .where(eq(UserModel.id, userId));

      if (!user) {
        throw new Error("User not found or something went wrong.");
      }

      const cartItemIds = cartCheckoutItems.map(
        (cartCheckoutItem) => cartCheckoutItem.cartItemId,
      );
      const shippingServiceIds = cartCheckoutItems.map(
        (cartCheckoutItem) => cartCheckoutItem.shippingServiceId,
      );

      const cartItems = (await tx
        .select(cartItemResponse)
        .from(CartItemModel)
        .leftJoin(BookModel, eq(CartItemModel.bookId, BookModel.id))
        .where(inArray(CartItemModel.id, cartItemIds))) as CartItemResponse[];

      if (!cartItems || cartItems.length <= 0) {
        throw new Error("Cart items invalid or something wrong");
      }

      // Kelompokkan cart items berdasarkan penjual
      const sellerGroups = cartItems.reduce(
        (groups, item) => {
          const sellerId = item.book.seller.id;
          groups[sellerId] = groups[sellerId] || {
            items: [],
            shippingServices: new Set(),
          };
          groups[sellerId].items.push(item);

          // Tambahkan shipping service ID untuk grup ini
          const checkoutItem = cartCheckoutItems.find(
            (ci) => ci.cartItemId === item.id,
          );
          if (checkoutItem) {
            groups[sellerId].shippingServices.add(
              checkoutItem.shippingServiceId,
            );
          }
          return groups;
        },
        {} as Record<
          string,
          { items: CartItemResponse[]; shippingServices: Set<string> }
        >,
      );

      // Validasi shipping service per penjual
      for (const sellerId of Object.keys(sellerGroups)) {
        const group = sellerGroups[sellerId];
        if (group.shippingServices.size > 1) {
          throw new Error(
            "Items dari penjual yang sama harus menggunakan layanan pengiriman yang sama",
          );
        }
      }

      const shippingServices = await tx
        .select()
        .from(ShippingServiceModel)
        .where(inArray(ShippingServiceModel.id, shippingServiceIds));

      if (!shippingServices || shippingServices.length <= 0) {
        throw new Error("Shipping services invalid or something wrong");
      }

      const [paymentMethod] = await tx
        .select()
        .from(PaymentMethodModel)
        .where(eq(PaymentMethodModel.id, paymentMethodId));

      if (!paymentMethod) {
        throw new Error("Payment method not found.");
      }

      const adminFee = 2500;
      const discount = 0;

      // Hitung biaya ongkir per penjual
      let totalShippingServicesFee = 0;
      const shippingFeeMap = new Map<string, number>(); // [sellerId, shippingFee]

      for (const sellerId of Object.keys(sellerGroups)) {
        const group = sellerGroups[sellerId];
        const shippingServiceId = Array.from(group.shippingServices)[0];
        const shippingService = shippingServices.find(
          (ss) => ss.id === shippingServiceId,
        );

        if (!shippingService) {
          throw new Error("Layanan pengiriman tidak valid");
        }

        // Hitung biaya ongkir sekali per penjual
        const shippingFee = Number(shippingService.price);
        shippingFeeMap.set(sellerId, shippingFee);
        totalShippingServicesFee += shippingFee;
      }

      // Hitung total harga dan buat order data
      let subtotalPrice = 0;
      const ordersData: IOrderData[] = [];

      for (const sellerId of Object.keys(sellerGroups)) {
        const group = sellerGroups[sellerId];
        const shippingFee = shippingFeeMap.get(sellerId) || 0;
        const itemsCount = group.items.length;

        for (const item of group.items) {
          const itemPrice = Number(item.priceAtCart) * Number(item.quantity);
          subtotalPrice += itemPrice;

          // Bagi biaya ongkir ke semua item dalam grup
          const shippingPerItem = shippingFee / itemsCount;

          ordersData.push({
            userId,
            bookId: item.bookId,
            quantity: item.quantity,
            shippingServiceId: Array.from(group.shippingServices)[0],
            transactionId: "",
            totalPrice: itemPrice + shippingPerItem,
            priceSold: Number(item.priceAtCart),
          });
        }
      }

      const totalPrice =
        subtotalPrice + totalShippingServicesFee + adminFee - discount;

      const [transaction] = await tx
        .insert(TransactionModel)
        .values({
          userId,
          paymentMethodId,
          totalShippingServicesFee,
          adminFee,
          discount,
          paymentMethodFee: paymentMethod.fee,
          paymentReference: paymentMethod.name,
          subtotalPrice,
          totalPrice,
        })
        .returning();

      try {
        // * Payment gateway (Xendit)
        const xenditInvoice = await xenditInvoiceClient.createInvoice({
          data: {
            amount: totalPrice,
            externalId: transaction.id, // * Pake yang dari transaction
            payerEmail: user.email,
            currency: "IDR",
            invoiceDuration: "172800", // * 48 jam
            reminderTime: 1, // * Reminder nanti pake socket kalo bisa
            paymentMethods: [paymentMethod.name],
            items: cartItems.map((cartItem) => ({
              name: cartItem.book ? cartItem.book.title : "no title",
              price: cartItem.priceAtCart,
              quantity: cartItem.quantity,
              category: "book",
              referenceId: cartItem.bookId,
            })),
          },
        });

        console.log("Xendit invoice created:", xenditInvoice);

        // * Simpan URL invoice (opsional)
        await tx
          .update(TransactionModel)
          .set({ paymentInvoiceUrl: xenditInvoice.invoiceUrl })
          .where(eq(TransactionModel.id, transaction.id));
      } catch (error) {
        console.error("Error creating Xendit invoice:", error);
        throw new Error("Failed to create invoice with Xendit.");
      }

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
  } catch (error) {
    console.error("Error in createOrderService:", error);

    throw new Error(
      JSON.stringify(error) ?? "Something went wrong while creating order.",
    );
  }
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
