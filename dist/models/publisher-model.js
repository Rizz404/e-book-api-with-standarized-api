"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const PublisherTable = (0, pg_core_1.pgTable)("publishers", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    description: (0, pg_core_1.text)(),
    website: (0, pg_core_1.text)().array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
}, (table) => [(0, pg_core_1.uniqueIndex)().on(table.name), (0, pg_core_1.uniqueIndex)().on(table.email)]);
exports.default = PublisherTable;
//# sourceMappingURL=publisher-model.js.map