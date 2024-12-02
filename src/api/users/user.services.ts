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
import UserProfileModel from "../user-profile/user.profile.model";
import UserModel, { InsertUserDTO, SelectUserDTO } from "./user.model";

export const userResponse = {
  id: UserModel.id,
  username: UserModel.username,
  email: UserModel.email,
  role: UserModel.role,
  profilePicture: UserModel.profilePicture,
  isVerified: UserModel.isVerified,
  isEmailVerified: UserModel.isEmailVerified,
  createdAt: UserModel.createdAt,
  updatedAt: UserModel.updatedAt,
};

export const createUserService = async (userData: SelectUserDTO) => {
  const { username, email, password, role, profilePicture } = userData;
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  return (
    await db
      .insert(UserModel)
      .values({
        username,
        email,
        password: hashedPassword,
        role,
        profilePicture,
      })
      .returning(userResponse)
  )[0];
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

export const findUserByIdService = async (id: string, withPassword = false) => {
  return (
    await db
      .select({
        ...userResponse,
        ...(withPassword && { password: UserModel.password }),
        userProfile: UserProfileModel,
      })
      .from(UserModel)
      .leftJoin(UserProfileModel, eq(UserModel.id, UserProfileModel.userId))
      .where(eq(UserModel.id, id))
      .limit(1)
  )[0];
};

export const findUserByUsernameOrEmailService = async (
  username: string,
  email: string,
  withPassword = false,
) => {
  return (
    await db
      .select({
        ...userResponse,
        ...(withPassword && { password: UserModel.password }),
        userProfile: UserProfileModel,
      })
      .from(UserModel)
      .leftJoin(UserProfileModel, eq(UserModel.id, UserProfileModel.userId))
      .where(or(eq(UserModel.username, username), eq(UserModel.email, email)))
      .limit(1)
  )[0];
};

export const findUserByColumnService = async <
  Column extends keyof SelectUserDTO,
>(
  column: Column,
  value: SelectUserDTO[Column],
) => {
  return (
    await db
      .select(userResponse)
      .from(UserModel)
      .leftJoin(UserProfileModel, eq(UserModel.id, UserProfileModel.userId))
      .where(eq(UserModel[column], value!))
      .limit(1)
  )[0];
};

export const updateUserService = async (
  userId: string,
  userData: Partial<InsertUserDTO>,
) => {
  const { username, email, profilePicture, isVerified, role, isEmailVerified } =
    userData;
  const updateData = {
    ...(username !== undefined && { username }),
    ...(email !== undefined && { email }),
    ...(profilePicture !== undefined && { profilePicture }),
    ...(isVerified !== undefined && { isVerified }),
    ...(isEmailVerified !== undefined && { isEmailVerified }),
    ...(role !== undefined && { role }),
  };

  if (Object.keys(updateData).length === 0) {
    return await findUserByIdService(userId);
  }

  return (
    await db
      .update(UserModel)
      .set(updateData)
      .where(eq(UserModel.id, userId))
      .returning(userResponse)
  )[0];
};

export const updateUserPasswordService = async (
  userId: string,
  storedPassword: string,
  newPassword: string,
) => {
  const user = (
    await db
      .select({ password: UserModel.password })
      .from(UserModel)
      .where(eq(UserModel.id, userId))
      .limit(1)
  )[0];

  if (!user) {
    throw new Error("User not found");
  }

  // Bandingkan password lama
  const isPasswordValid = await bcrypt.compare(storedPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect current password");
  }

  // Hash password baru
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password di database
  return await db
    .update(UserModel)
    .set({ password: hashedPassword })
    .where(eq(UserModel.id, userId));
};

export const deleteUserService = async (userId: string) => {
  return (
    await db
      .delete(UserModel)
      .where(eq(UserModel.id, userId))
      .returning(userResponse)
  )[0];
};
