import { RequestHandler } from "express";
import db from "../config/database-config";
import UserTable, { UserInsertType } from "../models/user-model";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "../utils/api-response-util";
import { desc, eq, or } from "drizzle-orm";
import UserProfileTable from "../models/user-profile-model";
import bcrypt from "bcrypt";
import parsePagination from "../utils/parse-pagination";
import { addFilters } from "../utils/query-utils";
import { count } from "drizzle-orm";

export const userResponse = {
  id: UserTable.id,
  username: UserTable.username,
  email: UserTable.email,
  role: UserTable.role,
  profilePicture: UserTable.profilePicture,
  isVerified: UserTable.isVerified,
  createdAt: UserTable.createdAt,
  updatedAt: UserTable.updatedAt,
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const { username, email, password, role, profilePicture }: UserInsertType =
      req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = (
      await db
        .select()
        .from(UserTable)
        .where((table) =>
          or(eq(table.username, username), eq(table.email, email)),
        )
        .limit(1)
    )[0];

    if (user) {
      return createErrorResponse(res, "User already exist", 400);
    }

    const newUser = await db.insert(UserTable).values({
      username,
      email,
      password: hashedPassword,
      role,
      profilePicture,
    });

    createSuccessResponse(res, newUser, "User created successfully", 201);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      role,
      isVerified,
    } = req.query as unknown as {
      page?: string;
      limit?: string;
      role?: "USER" | "ADMIN";
      isVerified?: boolean;
    };

    // * Validasi dan parsing `page` dan `limit` pake function
    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    // * Filter
    const filters = addFilters(UserTable, [
      role ? (table) => eq(table.role, role) : undefined,
      isVerified !== undefined
        ? (table) => eq(table.isVerified, isVerified)
        : undefined,
    ]);

    const totalItems = await db
      .select({ count: count() })
      .from(UserTable)
      .where(filters);

    // * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
    const users = await db
      .select(userResponse)
      .from(UserTable)
      .leftJoin(UserProfileTable, eq(UserTable.id, UserProfileTable.userId))
      .where(filters)
      .orderBy(desc(UserTable.createdAt))
      .limit(parseInt(limit))
      .offset(offset);

    createSuccessResponse(
      res,
      createPaginatedResponse(
        users,
        currentPage,
        itemsPerPage,
        totalItems[0]?.count || 0,
      ),
    );
  } catch (error) {
    createErrorResponse(res, error);
  }
};

// * Selalu kembalikan array kalau select pakai .select bukan .query
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = (
      await db
        .select(userResponse)
        .from(UserTable)
        .leftJoin(UserProfileTable, eq(UserTable.id, UserProfileTable.userId))
        .where((table) => eq(table.id, userId))
        .limit(1)
    )[0];

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    createSuccessResponse(res, user);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const user = (
      await db
        .select()
        .from(UserTable)
        .where((table) => eq(table.id, id))
        .limit(1)
        .leftJoin(UserProfileTable, eq(UserTable.id, UserProfileTable.userId))
    )[0];

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    createSuccessResponse(res, user);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const updateUserById: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      username,
      email,
      profilePicture,
      isVerified,
      role,
    }: Partial<UserInsertType> = req.body;

    const existingUser = (
      await db
        .select(userResponse)
        .from(UserTable)
        .where((table) => eq(table.id, userId))
        .limit(1)
    )[0];

    if (!existingUser) {
      return createErrorResponse(res, "User not found", 404);
    }

    const updatedUser = (
      await db
        .update(UserTable)
        .set({
          ...(username !== undefined && { username }),
          ...(email !== undefined && { email }),
          ...(profilePicture !== undefined && { profilePicture }),
          ...(isVerified !== undefined && { isVerified }),
          ...(role !== undefined && { role }),
        })
        .where(eq(UserTable.id, userId))
        .returning(userResponse)
    )[0];

    createSuccessResponse(res, updatedUser);
  } catch (error) {
    createErrorResponse(res, error);
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return createErrorResponse(
        res,
        "Something went wrong, id not found",
        403,
      );
    }

    const { username, email, profilePicture }: Partial<UserInsertType> =
      req.body;

    const existingUser = (
      await db
        .select(userResponse)
        .from(UserTable)
        .where((table) => eq(table.id, userId))
        .limit(1)
    )[0];

    if (!existingUser) {
      return createErrorResponse(res, "User not found", 404);
    }

    const updatedUser = (
      await db
        .update(UserTable)
        .set({
          ...(username !== undefined && { username }),
          ...(email !== undefined && { email }),
          ...(profilePicture !== undefined && { profilePicture }),
        })
        .where(eq(UserTable.id, userId))
        .returning(userResponse)
    )[0];

    createSuccessResponse(res, updatedUser);
  } catch (error) {
    createErrorResponse(res, error);
  }
};
