import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  createUserAddress,
  deleteUserAddressById,
  getUserAddressById,
  getUserAddresss,
  updateUserAddressById,
} from "./user-address.handlers";
// import { createUserAddressSchema } from "./user-address.validations";

const router = express.Router();

router
  .route("/")
  .post(authMiddleware(), createUserAddress)
  .get(authMiddleware(), getUserAddresss);
router
  .route("/:userAddressId")
  .get(getUserAddressById)
  .patch(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    updateUserAddressById,
  )
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteUserAddressById,
  );

export default router;
