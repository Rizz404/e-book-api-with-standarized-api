"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_core_1 = require("drizzle-orm/pg-core");
const LanguageTable = (0, pg_core_1.pgTable)("languages", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    code: (0, pg_core_1.varchar)({ length: 20 }).notNull(),
    name: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
}, (table) => [(0, pg_core_1.uniqueIndex)().on(table.code), (0, pg_core_1.uniqueIndex)().on(table.name)]);
exports.default = LanguageTable;
//# sourceMappingURL=language-model.js.map