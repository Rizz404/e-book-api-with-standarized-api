import { faker } from "@faker-js/faker";
import {
  and,
  Column,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
  SQLWrapper,
} from "drizzle-orm";

import db from "../../config/database.config";
import LanguageModel from "../languages/language.model";
import PublisherModel from "../publishers/publisher.model";
import TransactionModel, {
  InsertTransactionDTO,
  SelectTransactionDTO,
} from "../transactions/transaction.model";
import UserModel from "../users/user.model";

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
    .select()
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
      .select()
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
      .select()
      .from(TransactionModel)
      .leftJoin(UserModel, eq(TransactionModel.userId, UserModel.id))
      .where(eq(TransactionModel[column], value!))
      .limit(1)
  )[0];
};

export const updateTransactionService = async (
  transactionId: string,
  userId: string,
  transactionData: Partial<InsertTransactionDTO>,
) => {
  const { status } = transactionData;
  let newSlug: string | undefined;

  const updateData = {
    ...(status !== undefined && { status }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findTransactionByIdService(transactionId);
  }

  return (
    await db
      .update(TransactionModel)
      .set(updateData)
      .where(eq(TransactionModel.id, transactionId))
      .returning()
  )[0];
};

export const deleteTransactionService = async (transactionId: string) => {
  return (
    await db
      .delete(TransactionModel)
      .where(eq(TransactionModel.id, transactionId))
      .returning()
  )[0];
};
