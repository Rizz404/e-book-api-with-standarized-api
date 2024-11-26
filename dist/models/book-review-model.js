"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_core_1 = require("drizzle-orm/pg-core");
const user_model_1 = __importDefault(require("./user-model"));
const drizzle_orm_1 = require("drizzle-orm");
const book_model_1 = __importDefault(require("./book-model"));
const BookReviewTable = (0, pg_core_1.pgTable)("book_reviews", {
    id: (0, pg_core_1.uuid)().primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => user_model_1.default.id)
        .notNull(),
    bookId: (0, pg_core_1.uuid)("book_id")
        .references(() => book_model_1.default.id)
        .notNull(),
    rating: (0, pg_core_1.smallint)(),
    comment: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.default = BookReviewTable;
//# sourceMappingURL=book-review-model.js.map