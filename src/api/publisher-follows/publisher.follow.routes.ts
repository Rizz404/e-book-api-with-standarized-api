import express from "express";

import { authMiddleware } from "../../middleware/auth-middleware";
import roleValidationMiddleware from "../../middleware/role-validation-middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator-middleware";
import {
  followPublisherByPublisherId,
  getPublishersFollowed,
  unFollowPublisherByPublisherId,
} from "./publisher.follow.handlers";
// import { createPublisherSchema } from "./publisher.follow.validations";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware({ authType: "required" }), getPublishersFollowed);
router
  .route("/:publisherId")
  .post(authMiddleware({ authType: "required" }), followPublisherByPublisherId)
  .delete(
    authMiddleware({ authType: "required" }),
    unFollowPublisherByPublisherId,
  );

export default router;
