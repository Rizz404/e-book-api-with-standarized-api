"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("dotenv/config");
const user_routes_1 = __importDefault(require("./routes/user-routes"));
const auth_routes_1 = __importDefault(require("./routes/auth-routes"));
const compression_1 = __importDefault(require("compression"));
// * INIT
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const router = express_1.default.Router();
// * Middleware
app.use(body_parser_1.default.json({ limit: "30mb" }));
app.use(body_parser_1.default.urlencoded({ limit: "30mb", extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use("/api", router);
// * Routes
router.use("/users", user_routes_1.default);
router.use("/auth", auth_routes_1.default);
// * Server
app.listen(PORT, () => console.log(`Server run on port ${PORT}`));
//# sourceMappingURL=index.js.map