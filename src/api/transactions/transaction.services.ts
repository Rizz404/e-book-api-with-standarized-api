import { and, count, desc, eq, sql } from "drizzle-orm";

import db from "../../config/database.config";
import BookModel from "../books/book.model";
import OrderModel from "../orders/order.model";
import TransactionModel, {
  InsertTransactionDTO,
  SelectTransactionDTO,
} from "../transactions/transaction.model";
import UserModel from "../users/user.model";
import { CreateInvoiceRequest, Invoice } from "xendit-node/invoice/models";
import { xenditInvoiceClient } from "../../config/xendit-config";

export const transactionResponse = {
  id: TransactionModel.id,
  userId: TransactionModel.userId,
  adminFee: TransactionModel.adminFee,
  totalShippingServicesFee: TransactionModel.totalShippingServicesFee,
  paymentMethodFee: TransactionModel.paymentMethodFee,
  paymentReference: TransactionModel.paymentReference,
  discount: TransactionModel.discount,
  subtotalPrice: TransactionModel.subtotalPrice,
  totalPrice: TransactionModel.totalPrice,
  status: TransactionModel.status,
  createdAt: TransactionModel.createdAt,
  updatedAt: TransactionModel.updatedAt,
  user: {
    id: UserModel.id,
    username: UserModel.username,
    email: UserModel.email,
    profilePicture: UserModel.profilePicture,
  },
};

export const findTransactionsByFiltersService = async (
  limit: string,
  offset: number,
  filters?: {
    status?: "PENDING" | "COMPLETED" | "FAILED";
  },
) => {
  let filtersQuery;

  if (filters && filters.status) {
    filtersQuery = and(eq(TransactionModel.status, filters.status));
  }

  const totalItemsQuery = await db
    .select({ count: count() })
    .from(TransactionModel)
    .leftJoin(UserModel, eq(TransactionModel.userId, UserModel.id))
    .where(filtersQuery);

  const totalItems = totalItemsQuery[0]?.count || 0;

  const transactions = await db
    .select(transactionResponse)
    .from(TransactionModel)
    .leftJoin(UserModel, eq(TransactionModel.userId, UserModel.id))
    .where(filtersQuery)
    .orderBy(desc(TransactionModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, transactions };
};

export const findTransactionByIdService = async (id: string) => {
  return (
    await db
      .select(transactionResponse)
      .from(TransactionModel)
      .leftJoin(UserModel, eq(TransactionModel.userId, UserModel.id))
      .where(eq(TransactionModel.id, id))
      .limit(1)
  )[0];
};

export const findTransactionByColumnService = async <
  Column extends keyof SelectTransactionDTO,
>(
  column: Column,
  value: SelectTransactionDTO[Column], // Tipe data sesuai kolom
) => {
  return (
    await db
      .select(transactionResponse)
      .from(TransactionModel)
      .leftJoin(UserModel, eq(TransactionModel.userId, UserModel.id))
      .where(eq(TransactionModel[column], value!))
      .limit(1)
  )[0];
};

export const updateTransactionService = async (
  transactionId: string,
  transactionData: Partial<InsertTransactionDTO>,
) => {
  const { status } = transactionData;

  const updateData = {
    ...(status !== undefined && { status }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findTransactionByIdService(transactionId);
  }

  return await db.transaction(async (tx) => {
    const [updatedTransaction] = await tx
      .update(TransactionModel)
      .set(updateData)
      .where(eq(TransactionModel.id, transactionId))
      .returning();

    if (status === "FAILED" && updatedTransaction) {
      const orders = await tx
        .select({
          id: OrderModel.id,
          bookId: OrderModel.bookId,
          quantity: OrderModel.quantity,
        })
        .from(OrderModel)
        .where(eq(OrderModel.transactionId, transactionId));

      await Promise.all(
        orders.map(async (order) => {
          await tx
            .update(BookModel)
            .set({ stock: sql`${BookModel.stock} + ${order.quantity}` })
            .where(eq(BookModel.id, order.bookId));
          await tx
            .update(OrderModel)
            .set({ shippingStatus: "CANCELLED" })
            .where(eq(OrderModel.id, order.id));
        }),
      );
    }

    return updatedTransaction;
  });
};

export const deleteTransactionService = async (transactionId: string) => {
  return (
    await db
      .delete(TransactionModel)
      .where(eq(TransactionModel.id, transactionId))
      .returning()
  )[0];
};

export const testZendit = async (data: CreateInvoiceRequest) => {
  try {
    console.log("Invoice Creation Data:", JSON.stringify(data, null, 2));

    const response = await xenditInvoiceClient.createInvoice({
      data: {
        ...data,
        paymentMethods: ["DANA"],
      },
    });

    console.log("Xendit Invoice Response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("Xendit Invoice Creation Error:", error);
    throw error;
  }
};
