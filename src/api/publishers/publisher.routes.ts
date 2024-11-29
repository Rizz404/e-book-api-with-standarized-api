import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  createPublisher,
  deletePublisherById,
  getPublisherById,
  getPublishers,
  getPublishersLikeColumn,
  updatePublisherById,
} from "./publisher.handlers";
// import { createPublisherSchema } from "./publisher.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    // schemaValidatorMiddleware(createPublisherSchema),
    createPublisher,
  )
  .get(authMiddleware({ authType: "required" }), getPublishers);
router.get("/search", getPublishersLikeColumn);
router
  .route("/:publisherId")
  .get(getPublisherById)
  .patch(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    updatePublisherById,
  )
  .delete(
    authMiddleware({ authType: "required" }),
    roleValidationMiddleware(["ADMIN"]),
    deletePublisherById,
  );

export default router;
