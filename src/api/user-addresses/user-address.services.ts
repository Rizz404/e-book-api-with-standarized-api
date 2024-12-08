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
import UserAddressModel, {
  InsertUserAddressDTO,
  SelectUserAddressDTO,
} from "./user-address.model";

export const createUserAddressService = async (
  userAddressData: InsertUserAddressDTO,
) => {
  const [currentPrimaryUserAddress] = await db
    .select({
      userId: UserAddressModel.userId,
    })
    .from(UserAddressModel)
    .where(
      and(
        eq(UserAddressModel.userId, userAddressData.userId),
        eq(UserAddressModel.isPrimaryAddress, true),
      ),
    );

  if (currentPrimaryUserAddress) {
    await db
      .update(UserAddressModel)
      .set({ isPrimaryAddress: false })
      .where(
        and(
          eq(UserAddressModel.userId, currentPrimaryUserAddress.userId),
          eq(UserAddressModel.isPrimaryAddress, true),
        ),
      );
  }

  return (
    await db.insert(UserAddressModel).values(userAddressData).returning()
  )[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findUserAddressesByUserIdService = async (
  userId: string,
  limit: string,
  offset: number,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(UserAddressModel)
        .where(eq(UserAddressModel.id, userId))
    )[0].count || 0;
  const userAddresses = await db
    .select()
    .from(UserAddressModel)
    .where(eq(UserAddressModel.userId, userId))
    .orderBy(desc(UserAddressModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, userAddresses };
};

export const findUserAddressByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(UserAddressModel)
      .where(eq(UserAddressModel.id, id))
      .limit(1)
  )[0];
};

export const updateUserAddressService = async (
  userAddressId: string,
  userAddressData: Partial<InsertUserAddressDTO>,
) => {
  const { detailAddress, coordinate, isPrimaryAddress } = userAddressData;

  const [currentPrimaryUserAddress] = await db
    .select({
      userId: UserAddressModel.userId,
    })
    .from(UserAddressModel)
    .where(eq(UserAddressModel.id, userAddressId));

  if (isPrimaryAddress === true) {
    await db
      .update(UserAddressModel)
      .set({ isPrimaryAddress: false })
      .where(
        and(
          eq(UserAddressModel.userId, currentPrimaryUserAddress.userId),
          eq(UserAddressModel.isPrimaryAddress, true),
        ),
      );
  }

  return (
    await db
      .update(UserAddressModel)
      .set({
        ...(detailAddress !== undefined && { detailAddress }),
        ...(coordinate !== undefined && { coordinate }),
        ...(isPrimaryAddress !== undefined && { isPrimaryAddress }),
      })
      .where(eq(UserAddressModel.id, userAddressId))
      .returning()
  )[0];
};

export const deleteUserAddressService = async (userAddressId: string) => {
  return (
    await db
      .delete(UserAddressModel)
      .where(eq(UserAddressModel.id, userAddressId))
      .returning()
  )[0];
};
