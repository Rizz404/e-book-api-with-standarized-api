"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getUsers = exports.createUser = exports.userResponse = void 0;
const database_config_1 = __importDefault(require("../config/database-config"));
const user_model_1 = __importDefault(require("../models/user-model"));
const api_response_util_1 = require("../utils/api-response-util");
const drizzle_orm_1 = require("drizzle-orm");
exports.userResponse = {
    id: user_model_1.default.id,
    username: user_model_1.default.username,
    email: user_model_1.default.email,
    role: user_model_1.default.role,
    profilePicture: user_model_1.default.profilePicture,
    isVerified: user_model_1.default.isVerified,
    createdAt: user_model_1.default.createdAt,
    updatedAt: user_model_1.default.updatedAt,
};
const createUser = async (req, res) => {
    try {
        const {} = req.body;
    }
    catch (error) { }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const users = await database_config_1.default.select(exports.userResponse).from(user_model_1.default);
        (0, api_response_util_1.createSuccessResponse)(res, users);
    }
    catch (error) {
        (0, api_response_util_1.createErrorResponse)(res, error);
    }
};
exports.getUsers = getUsers;
// * Selalu kembalikan array kalau select pakai .select bukan .query
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const users = await database_config_1.default
            .select(exports.userResponse)
            .from(user_model_1.default)
            .where((table) => (0, drizzle_orm_1.eq)(table.id, userId))
            .limit(1);
        if (!users.length) {
            (0, api_response_util_1.createErrorResponse)(res, "User not found", 404);
            return; // * Harus seperti ini returnnya sekarang
        }
        (0, api_response_util_1.createSuccessResponse)(res, users[0]);
    }
    catch (error) {
        (0, api_response_util_1.createErrorResponse)(res, error);
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=user-controller.js.map