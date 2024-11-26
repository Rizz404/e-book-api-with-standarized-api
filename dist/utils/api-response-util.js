"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = exports.getErrorMessage = void 0;
const api_constants_1 = require("../constants/api-constants");
const crypto_1 = __importDefault(require("crypto"));
const generateTraceId = () => {
    const timestamp = Date.now().toString(36); // * Base36 untuk kompres timestamp
    const randomPart = crypto_1.default.randomBytes(8).toString("hex").slice(0, 8);
    return `${api_constants_1.TRACE_ID_PREFIX}-${timestamp}-${randomPart}`;
};
const createMetadata = (includedTraceId = false) => {
    const metaData = {
        version: api_constants_1.API_VERSION,
        timestamp: new Date().toISOString(),
    };
    if (includedTraceId) {
        metaData.trace_id = generateTraceId();
    }
    return metaData;
};
const getErrorMessage = (error) => {
    let message;
    if (error instanceof Error) {
        message = error.message;
    }
    else if (error && typeof error === "object" && "message" in error) {
        message = String(error.message);
    }
    else if (typeof error === "string") {
        message = error;
    }
    else {
        message = "An unknown error has occurred";
    }
    return message;
};
exports.getErrorMessage = getErrorMessage;
const createSuccessResponse = (res, data, message = "success", statusCode = 200) => {
    const apiResponse = {
        status: true,
        statusCode,
        message,
        data,
        meta: createMetadata(),
    };
    res.status(statusCode).json(apiResponse);
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (res, message, statusCode = 500) => {
    const apiResponse = {
        status: false,
        statusCode,
        message: (0, exports.getErrorMessage)(message),
        meta: createMetadata(),
    };
    res.status(statusCode).json(apiResponse);
};
exports.createErrorResponse = createErrorResponse;
//# sourceMappingURL=api-response-util.js.map