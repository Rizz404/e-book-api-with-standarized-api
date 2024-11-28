import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createUser,
  deleteUserById,
  getUser,
  getUsers,
  getUsersLikeColumn,
  updateUser,
} from "./user.handlers";
import { createUserSchema } from "./user.validation";

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
  .get(authMiddleware({ authType: "required" }), getUser("req.user"))
  .patch(authMiddleware({ authType: "required" }), updateUser("req.user"));
router.get("/search", getUsersLikeColumn);
router
  .route("/:userId")
  .get(getUser("req.params"))
  .patch(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    updateUser("req.params"),
  )
  .delete(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    deleteUserById,
  );

export default router;
