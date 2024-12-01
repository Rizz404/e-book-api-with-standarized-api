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

import db from "../../config/database-config";
import ShippingServiceModel, {
  InsertShippingServiceDTO,
  SelectShippingServiceDTO,
} from "./shipping.service.model";

export const createShippingServiceService = async (
  shippingServiceData: InsertShippingServiceDTO,
) => {
  return (
    await db
      .insert(ShippingServiceModel)
      .values(shippingServiceData)
      .returning()
  )[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findShippingServicesByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(ShippingServiceModel)
        .where(filters)
    )[0].count || 0;
  const shippingServices = await db
    .select()
    .from(ShippingServiceModel)
    .where(filters)
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, shippingServices };
};

export const findShippingServicesLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(ShippingServiceModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const shippingServices = await db
    .select()
    .from(ShippingServiceModel)
    .where(ilike(column, `%${value}%`))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, shippingServices };
};

export const findShippingServiceByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(ShippingServiceModel)
      .where(eq(ShippingServiceModel.id, id))
      .limit(1)
  )[0];
};

export const findShippingServiceByColumnService = async (name: string) => {
  return (
    await db
      .select()
      .from(ShippingServiceModel)
      .where(or(eq(ShippingServiceModel.name, name)))
      .limit(1)
  )[0];
};

export const updateShippingServiceService = async (
  shippingServiceId: string,
  shippingServiceData: Partial<InsertShippingServiceDTO>,
) => {
  const { name, description, price, estimationTime } = shippingServiceData;

  return (
    await db
      .update(ShippingServiceModel)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(estimationTime !== undefined && { estimationTime }),
      })
      .where(eq(ShippingServiceModel.id, shippingServiceId))
      .returning()
  )[0];
};

export const deleteShippingServiceService = async (
  shippingServiceId: string,
) => {
  return (
    await db
      .delete(ShippingServiceModel)
      .where(eq(ShippingServiceModel.id, shippingServiceId))
      .returning()
  )[0];
};
