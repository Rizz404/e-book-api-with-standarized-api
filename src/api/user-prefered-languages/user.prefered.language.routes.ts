import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  addUserPreferedLanguageByLanguageId,
  getUserPreferedLanguagesFollowed,
  removeUserPreferedLanguageByLanguageId,
} from "./user.prefered.language.handlers";
// import { createUserSchema } from "./user.prefered.language.validations";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware({ authType: "required" }),
    getUserPreferedLanguagesFollowed,
  );
router
  .route("/:userId")
  .post(
    authMiddleware({ authType: "required" }),
    addUserPreferedLanguageByLanguageId,
  )
  .delete(
    authMiddleware({ authType: "required" }),
    removeUserPreferedLanguageByLanguageId,
  );

export default router;
