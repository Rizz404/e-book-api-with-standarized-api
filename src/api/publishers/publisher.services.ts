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
import PublisherModel, {
  InsertPublisherDTO,
  SelectPublisherDTO,
} from "./publisher.model";

export const createPublisherService = async (
  publisherData: InsertPublisherDTO,
) => {
  return (await db.insert(PublisherModel).values(publisherData).returning())[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findPublishersByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (await db.select({ count: count() }).from(PublisherModel).where(filters))[0]
      .count || 0;
  const publishers = await db
    .select()
    .from(PublisherModel)
    .where(filters)
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, publishers };
};

export const findPublishersLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(PublisherModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const publishers = await db
    .select()
    .from(PublisherModel)
    .where(ilike(column, `%${value}%`))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, publishers };
};

export const findPublisherByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(PublisherModel)
      .where(eq(PublisherModel.id, id))
      .limit(1)
  )[0];
};

export const findPublisherByColumnService = async (name: string) => {
  return (
    await db
      .select()
      .from(PublisherModel)
      .where(or(eq(PublisherModel.name, name)))
      .limit(1)
  )[0];
};

export const updatePublisherService = async (
  publisherId: string,
  publisherData: Partial<InsertPublisherDTO>,
) => {
  const { name, email, description, website } = publisherData;

  return (
    await db
      .update(PublisherModel)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
      })
      .where(eq(PublisherModel.id, publisherId))
      .returning()
  )[0];
};

export const deletePublisherService = async (publisherId: string) => {
  return (
    await db
      .delete(PublisherModel)
      .where(eq(PublisherModel.id, publisherId))
      .returning()
  )[0];
};
