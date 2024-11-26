"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = express_1.default.Router();
router.route("/").get((0, auth_middleware_1.authMiddleware)({ authType: "required" }), user_controller_1.getUsers);
router.route("/:userId").get(user_controller_1.getUserById);
exports.default = router;
//# sourceMappingURL=user-routes.js.map