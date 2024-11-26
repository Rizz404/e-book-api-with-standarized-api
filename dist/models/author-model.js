"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const AuthorTable = (0, pg_core_1.pgTable)("authors", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    biography: (0, pg_core_1.text)(),
    birthDate: (0, pg_core_1.date)("birth_date").notNull(),
    deathDate: (0, pg_core_1.date)("death_date").notNull(),
    profilePicture: (0, pg_core_1.varchar)("profile_picture", { length: 255 })
        .notNull()
        .default("https://i.pinimg.com/236x/11/64/4b/11644bef2986a35c7b2e2f3886cddb3f.jpg"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
}, (table) => [(0, pg_core_1.uniqueIndex)().on(table.name)]);
exports.default = AuthorTable;
//# sourceMappingURL=author-model.js.map