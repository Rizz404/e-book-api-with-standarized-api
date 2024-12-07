import { and, between, count, eq, SQL } from "drizzle-orm";

import db from "../../config/database-config";
import BookModel from "../books/book.model";
import PaymentMethodModel from "../payment-methods/payment.method.model";
import ShippingServiceModel from "../shipping-services/shipping.service.model";
import TransactionModel from "../transactions/transaction.model";
import OrderModel, { InsertOrderDTO, SelectOrderDTO } from "./order.model";

export interface Filter {
  userId?: string;
  shippingStatus?: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  priceRange?: { start: string; end: string };
}

export const createOrderService = async (
  orderData: Pick<
    SelectOrderDTO,
    "userId" | "bookId" | "quantity" | "shippingServiceId"
  >,
  paymentMethodId: string,
) => {
  const { userId, bookId, quantity, shippingServiceId } = orderData;

  return await db.transaction(async (tx) => {
    // Ambil data buku
    const [book] = await tx
      .select()
      .from(BookModel)
      .where(eq(BookModel.id, bookId))
      .limit(1);

    if (!book) {
      tx.rollback();
      throw new Error("Book not found or unavailable.");
    }

    console.log(`Book in order transaction: ${JSON.stringify(book, null, 2)}`);

    if (quantity > book.stock || book.status !== "AVAILABLE") {
      tx.rollback();
      throw new Error("Invalid quantity or book is unavailable.");
    }

    // Ambil data shipping service
    const [shippingService] = await tx
      .select()
      .from(ShippingServiceModel)
      .where(eq(ShippingServiceModel.id, shippingServiceId))
      .limit(1);

    if (!shippingService) {
      tx.rollback();
      throw new Error("Shipping service not found.");
    }

    // Ambil data payment method
    const [paymentMethod] = await tx
      .select()
      .from(PaymentMethodModel)
      .where(eq(PaymentMethodModel.id, paymentMethodId))
      .limit(1);

    if (!paymentMethod) {
      tx.rollback();
      throw new Error("Payment method not found.");
    }

    // Hitung total harga
    const subtotalPrice = book.price * quantity;
    const adminFee = 2500;
    const discount = 0;
    const totalPrice = subtotalPrice + adminFee - discount * 100;

    // Buat transaksi
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

    if (!createTransaction) {
      tx.rollback();
      throw new Error("Failed to create transaction.");
    }

    // Buat order
    const [createOrder] = await tx
      .insert(OrderModel)
      .values({
        ...orderData,
        transactionId: createTransaction.id,
        totalPrice,
        priceSold: book.price,
      })
      .returning();

    if (!createOrder) {
      tx.rollback();
      throw new Error("Failed to create order.");
    }

    return createOrder;
  });
};

export const findOrdersByFiltersService = async (
  limit: string,
  offset: number,
  filters?: Filter,
) => {
  // * Nanti ganti pake array kalo gabut, sekarang jangan dulu
  let filtersQuery: SQL<unknown> | undefined;

  if (filters && filters.userId) {
    filtersQuery = and(eq(OrderModel.userId, filters.userId));
  }

  if (filters && filters.shippingStatus) {
    filtersQuery = and(
      filtersQuery,
      eq(OrderModel.shippingStatus, filters.shippingStatus),
    );
  }

  if (filters && filters.priceRange) {
    filtersQuery = and(
      filtersQuery,
      between(
        OrderModel.totalPrice,
        parseFloat(filters.priceRange.start),
        parseFloat(filters.priceRange.end),
      ),
    );
  }

  const totalItems = (
    await db
      .select({ count: count() })
      .from(OrderModel)
      .leftJoin(BookModel, eq(BookModel.id, OrderModel.bookId))
      .where(filtersQuery)
  )[0].count;

  const orders = await db
    .select()
    .from(OrderModel)
    .leftJoin(BookModel, eq(BookModel.id, OrderModel.bookId))
    .where(filtersQuery)
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, orders };
};

export const findOrderByIdService = async (orderId: string) => {
  return (
    await db
      .select()
      .from(OrderModel)
      .leftJoin(BookModel, eq(BookModel.id, OrderModel.bookId))
      .where(eq(OrderModel.id, orderId))
  )[0];
};

export const updateOrderService = async (
  orderId: string,
  orderData: InsertOrderDTO,
) => {
  const { shippingStatus } = orderData;

  const updateData = {
    ...(shippingStatus !== undefined && { shippingStatus }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findOrderByIdService(orderId);
  }

  return await db
    .update(OrderModel)
    .set(updateData)
    .where(eq(OrderModel.id, orderId));
};

export const deleteOrderService = async (orderId: string) => {
  return (
    await db.delete(OrderModel).where(eq(OrderModel.id, orderId)).returning()
  )[0];
};
