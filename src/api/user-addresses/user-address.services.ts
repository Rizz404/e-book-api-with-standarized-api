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
        eq(UserAddressModel.isPrimary, true),
      ),
    );

  if (currentPrimaryUserAddress) {
    await db
      .update(UserAddressModel)
      .set({ isPrimary: false })
      .where(
        and(
          eq(UserAddressModel.userId, currentPrimaryUserAddress.userId),
          eq(UserAddressModel.isPrimary, true),
        ),
      );
  }

  return (
    await db.insert(UserAddressModel).values(userAddressData).returning()
  )[0];
};

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
  // Handle primary address logic
  if (userAddressData.isPrimary === true) {
    const [currentAddress] = await db
      .select({ userId: UserAddressModel.userId })
      .from(UserAddressModel)
      .where(eq(UserAddressModel.id, userAddressId));

    await db
      .update(UserAddressModel)
      .set({ isPrimary: false })
      .where(
        and(
          eq(UserAddressModel.userId, currentAddress.userId),
          eq(UserAddressModel.isPrimary, true),
        ),
      );
  }

  const getUpdateFields = (data: Partial<InsertUserAddressDTO>) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && key !== "isPrimary") {
        // * Gunakan type assertion yang lebih spesifik
        const validKey = key as keyof InsertUserAddressDTO;
        acc[validKey] = value as never;
      }
      return acc;
    }, {} as Partial<InsertUserAddressDTO>);
  };

  return (
    await db
      .update(UserAddressModel)
      .set({
        ...getUpdateFields(userAddressData), // Auto-include all defined fields
        ...(userAddressData.isPrimary !== undefined && {
          isPrimary: userAddressData.isPrimary,
        }),
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
