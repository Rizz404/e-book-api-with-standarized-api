import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import roleValidationMiddleware from "../../middleware/role-validation.middleware";
import schemaValidatorMiddleware from "../../middleware/schema-validator.middleware";
import {
  createShippingService,
  deleteShippingServiceById,
  getShippingServiceById,
  getShippingServices,
  getShippingServicesLikeColumn,
  updateShippingServiceById,
} from "./shipping-service.handlers";
// import { createShippingServiceSchema } from "./shipping-service.validations";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    createShippingService,
  )
  .get(authMiddleware(), getShippingServices);
router.get("/search", getShippingServicesLikeColumn);
router
  .route("/:shippingServiceId")
  .get(getShippingServiceById)
  .patch(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    updateShippingServiceById,
  )
  .delete(
    authMiddleware(),
    roleValidationMiddleware(["ADMIN"]),
    deleteShippingServiceById,
  );

export default router;
