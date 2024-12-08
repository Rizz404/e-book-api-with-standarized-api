import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  addUserPreferedLanguageByLanguageId,
  getUserPreferedLanguagesFollowed,
  removeUserPreferedLanguageByLanguageId,
} from "./user-prefered-language.handlers";
// import { createUserSchema } from "./user-prefered-language.validations";

const router = express.Router();

router.route("/").get(authMiddleware(), getUserPreferedLanguagesFollowed);
router
  .route("/:userId")
  .post(authMiddleware(), addUserPreferedLanguageByLanguageId)
  .delete(authMiddleware(), removeUserPreferedLanguageByLanguageId);

export default router;
