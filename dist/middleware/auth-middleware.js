"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const api_response_util_1 = require("../utils/api-response-util");
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const authMiddleware = ({ authType = "required", }) => {
    return (req, res, next) => {
        try {
            const { authorization: authHeader } = req.headers;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const accessToken = authHeader.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
                if (!decoded.id) {
                    (0, api_response_util_1.createErrorResponse)(res, "Invalid token", 403);
                    return;
                }
                req.user = decoded;
                if (!req.user) {
                    (0, api_response_util_1.createErrorResponse)(res, "Something wrong cause req.user not initialized", 403);
                    return;
                }
            }
            if (authType === "required" && !req.user) {
                (0, api_response_util_1.createErrorResponse)(res, "Unauthorized", 401);
                return;
            }
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                (0, api_response_util_1.createErrorResponse)(res, "Token expired", 401);
            }
            else {
                (0, api_response_util_1.createErrorResponse)(res, error);
            }
        }
    };
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth-middleware.js.map