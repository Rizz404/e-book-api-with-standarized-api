import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
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

router
  .route("/")
  .post(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    schemaValidatorMiddleware(createUserSchema),
    createUser,
  )
  .get(authMiddleware({ authType: "required" }), getUsers);
router
  .route("/profile")
  .get(authMiddleware({ authType: "required" }), getCurrentUser)
  .patch(authMiddleware({ authType: "required" }), updateCurrentUser);
router.get("/search", getUsersLikeColumn);
router.patch("/update-password", updateCurrentUserPassword);
router
  .route("/:userId")
  .get(getUserById)
  .patch(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    updateUserById,
  )
  .delete(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    deleteUserById,
  );

export default router;
