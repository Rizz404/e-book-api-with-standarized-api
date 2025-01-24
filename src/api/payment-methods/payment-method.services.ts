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

import db from "../../config/database.config";
import PaymentMethodModel, {
  InsertPaymentMethodDTO,
  SelectPaymentMethodDTO,
} from "./payment-method.model";

export const createPaymentMethodService = async (
  paymentMethodData: InsertPaymentMethodDTO,
) => {
  return (
    await db.insert(PaymentMethodModel).values(paymentMethodData).returning()
  )[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findPaymentMethodsByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(PaymentMethodModel)
        .where(filters)
    )[0].count || 0;
  const paymentMethods = await db
    .select()
    .from(PaymentMethodModel)
    .where(filters)
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, paymentMethods };
};

export const findPaymentMethodsLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(PaymentMethodModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const paymentMethods = await db
    .select()
    .from(PaymentMethodModel)
    .where(ilike(column, `%${value}%`))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, paymentMethods };
};

export const findPaymentMethodByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(PaymentMethodModel)
      .where(eq(PaymentMethodModel.id, id))
      .limit(1)
  )[0];
};

export const findPaymentMethodByColumnService = async (name: string) => {
  return (
    await db
      .select()
      .from(PaymentMethodModel)
      .where(or(eq(PaymentMethodModel.name, name)))
      .limit(1)
  )[0];
};

export const updatePaymentMethodService = async (
  paymentMethodId: string,
  paymentMethodData: Partial<InsertPaymentMethodDTO>,
) => {
  const { name, description, fee } = paymentMethodData;

  return (
    await db
      .update(PaymentMethodModel)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(fee !== undefined && { fee }),
      })
      .where(eq(PaymentMethodModel.id, paymentMethodId))
      .returning()
  )[0];
};

export const deletePaymentMethodService = async (paymentMethodId: string) => {
  return (
    await db
      .delete(PaymentMethodModel)
      .where(eq(PaymentMethodModel.id, paymentMethodId))
      .returning()
  )[0];
};
