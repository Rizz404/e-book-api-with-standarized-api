import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createLanguage,
  deleteLanguageById,
  getLanguageById,
  getLanguages,
  getLanguagesLikeColumn,
  updateLanguageById,
} from "./language.handlers";
// import { createLanguageSchema } from "./language.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    // schemaValidatorMiddleware(createLanguageSchema),
    createLanguage,
  )
  .get(authMiddleware({ authType: "required" }), getLanguages);
router.get("/search", getLanguagesLikeColumn);
router
  .route("/:languageId")
  .get(getLanguageById)
  .patch(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    updateLanguageById,
  )
  .delete(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    deleteLanguageById,
  );

export default router;