import { RequestHandler } from "express";
import Joi, { ValidationOptions } from "joi";

import { createErrorResponse } from "../utils/api-response.utils";

const supportedMethods = ["POST", "PUT", "PATCH", "DELETE"];

const validationOptions: ValidationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false,
};

const schemaValidatorMiddleware = (
  schema: Joi.ObjectSchema<unknown>,
  useJoiError: true = true,
): RequestHandler => {
  return (req, res, next) => {
    const supportedMethod = supportedMethods.includes(req.method);

    if (!supportedMethod) {
      return next();
    }

    const { error, value } = schema.validate(req.body, validationOptions);

    if (error) {
      const defaultErrorMessage =
        "Invalid request. Please review request and try again.";

      const joiError = error.details.map(({ message, type }) => ({
        message: message.replace(/['"]/g, ""),
        type,
      }));
      return createErrorResponse(res, "Validation failed", 400, joiError);
    }

    req.body = value;
    next();
  };
};

export default schemaValidatorMiddleware;
