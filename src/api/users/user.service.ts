import bcrypt from "bcrypt";
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
import UserProfileModel from "../user-profile/user-profile.model";
import UserModel, { InsertUserDTO, SelectUserDTO } from "./user.model";

export const userResponse = {
  id: UserModel.id,
  username: UserModel.username,
  email: UserModel.email,
  role: UserModel.role,
  profilePicture: UserModel.profilePicture,
  isVerified: UserModel.isVerified,
  createdAt: UserModel.createdAt,
  updatedAt: UserModel.updatedAt,
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findUsersByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (await db.select({ count: count() }).from(UserModel).where(filters))[0]
      .count || 0;
  const users = await db
    .select(userResponse)
    .from(UserModel)
    .leftJoin(UserProfileModel, eq(UserModel.id, UserProfileModel.userId))
    .where(filters)
    .orderBy(desc(UserModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, users };
};

export const findUsersLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(UserModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const users = await db
    .select(userResponse)
    .from(UserModel)
    .leftJoin(UserProfileModel, eq(UserModel.id, UserProfileModel.userId))
    .where(ilike(column, `%${value}%`))
    .orderBy(desc(UserModel.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, users };
};

export const findUserByIdService = async (id: string) => {
  return (
    await db
      .select(userResponse)
      .from(UserModel)
      .leftJoin(UserProfileModel, eq(UserModel.id, UserProfileModel.userId))
      .where(eq(UserModel.id, id))
      .limit(1)
  )[0];
};

export const findUserByColumnService = async (
  username: string,
  email: string,
) => {
  return (
    await db
      .select(userResponse)
      .from(UserModel)
      .where(or(eq(UserModel.username, username), eq(UserModel.email, email)))
      .limit(1)
  )[0];
};

export const createUserService = async (
  userData: Pick<
    InsertUserDTO,
    "username" | "email" | "password" | "role" | "profilePicture"
  >,
) => {
  const { username, email, password, role, profilePicture } = userData;
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  return await db
    .insert(UserModel)
    .values({
      username,
      email,
      password: hashedPassword,
      role,
      profilePicture,
    })
    .returning(userResponse);
};

export const updateUserService = async (
  userId: string,
  userData: Partial<InsertUserDTO>,
) => {
  const { username, email, profilePicture, isVerified, role } = userData;

  return (
    await db
      .update(UserModel)
      .set({
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(profilePicture !== undefined && { profilePicture }),
        ...(isVerified !== undefined && { isVerified }),
        ...(role !== undefined && { role }),
      })
      .where(eq(UserModel.id, userId))
      .returning(userResponse)
  )[0];
};

export const deleteUserService = async (userId: string) => {
  return (
    await db
      .delete(UserModel)
      .where(eq(UserModel.id, userId))
      .returning(userResponse)
  )[0];
};
