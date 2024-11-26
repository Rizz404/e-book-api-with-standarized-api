"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const GenreTable = (0, pg_core_1.pgTable)("genres", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    description: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
}, (table) => [(0, pg_core_1.uniqueIndex)().on(table.name)]);
exports.default = GenreTable;
//# sourceMappingURL=genre-model.js.map