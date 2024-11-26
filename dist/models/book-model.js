"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumBookStatus = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_model_1 = __importDefault(require("./user-model"));
const author_model_1 = __importDefault(require("./author-model"));
const drizzle_orm_1 = require("drizzle-orm");
const publisher_model_1 = __importDefault(require("./publisher-model"));
const language_model_1 = __importDefault(require("./language-model"));
exports.enumBookStatus = (0, pg_core_1.pgEnum)("book_status", [
    "AVAILABLE",
    "SOLD",
    "ARCHIVED",
]);
const BookTable = (0, pg_core_1.pgTable)("books", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    authorId: (0, pg_core_1.uuid)("author_id")
        .references(() => author_model_1.default.id)
        .notNull(),
    sellerId: (0, pg_core_1.uuid)("seller_id")
        .references(() => user_model_1.default.id)
        .notNull(),
    publisherId: (0, pg_core_1.uuid)("publisher_id")
        .references(() => publisher_model_1.default.id)
        .notNull(),
    languageId: (0, pg_core_1.uuid)("language_id")
        .references(() => language_model_1.default.id)
        .notNull(),
    title: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    description: (0, pg_core_1.text)().notNull(),
    publicationDate: (0, pg_core_1.date)("publication_date").notNull(),
    slug: (0, pg_core_1.varchar)().notNull(),
    isbn: (0, pg_core_1.varchar)().notNull(),
    price: (0, pg_core_1.decimal)({ precision: 10, scale: 2 }).notNull().default("0.00"),
    stock: (0, pg_core_1.integer)().notNull().default(0),
    status: (0, exports.enumBookStatus)().default("AVAILABLE"),
    fileUrl: (0, pg_core_1.varchar)("file_url", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
}, 
// * Nama boleh ada yang sama tapi slugnya tidak, karena ditambah seller username
(table) => [(0, pg_core_1.index)().on(table.title), (0, pg_core_1.uniqueIndex)().on(table.slug)]);
exports.default = BookTable;
//# sourceMappingURL=book-model.js.map