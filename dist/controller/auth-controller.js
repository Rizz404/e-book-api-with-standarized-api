"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshExpiredToken = exports.signIn = exports.signUp = void 0;
const api_response_util_1 = require("../utils/api-response-util");
const user_model_1 = __importDefault(require("../models/user-model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_config_1 = __importDefault(require("../config/database-config"));
const drizzle_orm_1 = require("drizzle-orm");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            (0, api_response_util_1.createErrorResponse)(res, "Username, email, and password are required", 400);
            return;
        }
        const salt = await bcrypt_1.default.genSalt();
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const newUser = await database_config_1.default
            .insert(user_model_1.default)
            .values({ username, email, password: hashedPassword });
        (0, api_response_util_1.createSuccessResponse)(res, newUser, "User sign up successfully", 201);
    }
    catch (error) {
        (0, api_response_util_1.createErrorResponse)(res, error);
    }
};
exports.signUp = signUp;
const signIn = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!(username || email) || !password) {
            (0, api_response_util_1.createErrorResponse)(res, "Username or email and password are required", 400);
            return;
        }
        if (username && email) {
            (0, api_response_util_1.createErrorResponse)(res, "Pick username or email for login", 400);
            return;
        }
        // * Selalu kembalikan array ya, jangan lupa
        const user = (await database_config_1.default
            .select()
            .from(user_model_1.default)
            .where((table) => {
            if (username) {
                return (0, drizzle_orm_1.eq)(table.username, username);
            }
            if (email) {
                return (0, drizzle_orm_1.eq)(table.email, email);
            }
        })
            .limit(1))[0];
        if (!user) {
            (0, api_response_util_1.createErrorResponse)(res, "User not found", 404);
            return;
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            (0, api_response_util_1.createErrorResponse)(res, "Password not match", 400);
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }, process.env.JWT_ACCESS_TOKEN, {
            expiresIn: "1d",
        });
        // ! gak bisa langsung string inget
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_TOKEN, { expiresIn: "30d" });
        const userCredentials = {
            ...user,
            accessToken: accessToken, // * Objek user
            refreshToken: refreshToken, // * Id user
        };
        (0, api_response_util_1.createSuccessResponse)(res, userCredentials);
    }
    catch (error) {
        (0, api_response_util_1.createErrorResponse)(res, error);
    }
};
exports.signIn = signIn;
const refreshExpiredToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            (0, api_response_util_1.createErrorResponse)(res, "Unauthorized", 401);
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
        if (!decoded) {
            (0, api_response_util_1.createErrorResponse)(res, "Invalid token", 403);
            return;
        }
        const user = (await database_config_1.default
            .select()
            .from(user_model_1.default)
            .where((table) => (0, drizzle_orm_1.eq)(table.id, decoded.userId))
            .limit(1))[0];
        if (!user) {
            (0, api_response_util_1.createErrorResponse)(res, "User not found", 404);
            return;
        }
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1d" });
        (0, api_response_util_1.createSuccessResponse)(res, { newAccessToken }, "Successfully get new access token", 201);
    }
    catch (error) {
        (0, api_response_util_1.createErrorResponse)(res, error);
    }
};
exports.refreshExpiredToken = refreshExpiredToken;
// * Logout ada di client kecuali mau di server side taro refresh token di db
//# sourceMappingURL=auth-controller.js.map