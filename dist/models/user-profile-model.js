"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const user_model_1 = __importDefault(require("./user-model"));
const UserProfileTable = (0, pg_core_1.pgTable)("user_profiles", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => user_model_1.default.id)
        .notNull(),
    bio: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.default = UserProfileTable;
//# sourceMappingURL=user-profile-model.js.map