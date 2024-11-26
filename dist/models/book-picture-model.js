"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const book_model_1 = __importDefault(require("./book-model"));
const BookPictureTable = (0, pg_core_1.pgTable)("book_pictures", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    bookId: (0, pg_core_1.uuid)("book_id")
        .references(() => book_model_1.default.id)
        .notNull(),
    url: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    isCover: (0, pg_core_1.boolean)("is_cover").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
}, (table) => [(0, pg_core_1.uniqueIndex)().on(table.bookId, table.isCover)]);
exports.default = BookPictureTable;
//# sourceMappingURL=book-picture-model.js.map