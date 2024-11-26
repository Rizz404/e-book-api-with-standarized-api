"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumRole = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.enumRole = (0, pg_core_1.pgEnum)("user_role", ["USER", "ADMIN"]);
const UserTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    username: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    password: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    role: (0, exports.enumRole)().notNull().default("USER"),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default("https://i.pinimg.com/474x/fe/64/11/fe64116a7f610dbee15e840629fc7e67.jpg"),
    isVerified: (0, pg_core_1.boolean)().default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
}, (table) => [(0, pg_core_1.uniqueIndex)().on(table.username), (0, pg_core_1.uniqueIndex)().on(table.email)]);
exports.default = UserTable;
//# sourceMappingURL=user-model.js.map