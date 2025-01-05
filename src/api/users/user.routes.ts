import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import { uploadSingle } from "../../middleware/upload-file.middleware";
import {
  createUser,
  deleteUserById,
  getCurrentUser,
  getUserById,
  getUsers,
  getUsersLikeColumn,
  updateCurrentUser,
  updateCurrentUserPassword,
  updateUserById,
} from "./user.handlers";
import { createUserSchema } from "./user.validations";

const router = express.Router();

// #swagger.tags = ['Users']
router
  .route("/")
  .post(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    schemaValidatorMiddleware(createUserSchema),
    createUser,
  )
  .get(authMiddleware(), roleValidationMiddleware(["ADMIN"]), getUsers);
router
  .route("/profile")
  .get(authMiddleware(), getCurrentUser)
  .patch(
    authMiddleware(),
    uploadSingle("profilePicture", "users"),
    updateCurrentUser,
  );
router.get("/search", getUsersLikeColumn);
router.patch("/update-password", authMiddleware(), updateCurrentUserPassword);
router
  .route("/:userId")
  .get(getUserById)
  .patch(authMiddleware(), roleValidationMiddleware(["ADMIN"]), updateUserById)
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteUserById,
  );

export default router;
