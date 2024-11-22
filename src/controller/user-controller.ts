import { RequestHandler } from "express";
import db from "../config/database-config";
import UserTable from "../models/user-model";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/api-response-util";

export const createUser: RequestHandler = async (req, res) => {
  try {
    const {} = req.body;
  } catch (error) {}
};

export const getUsers: RequestHandler = async (req, res) => {
  try {
    const users = await db.select().from(UserTable);

    await createSuccessResponse(req, res, users);
  } catch (error) {
    await createErrorResponse(req, res, error);
  }
};
