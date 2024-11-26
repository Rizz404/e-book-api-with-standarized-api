"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_core_1 = require("drizzle-orm/pg-core");
const book_model_1 = __importDefault(require("./book-model"));
const genre_model_1 = __importDefault(require("./genre-model"));
const BookGenreTable = (0, pg_core_1.pgTable)("book_genre", {
    bookId: (0, pg_core_1.uuid)("book_id")
        .references(() => book_model_1.default.id)
        .notNull(),
    genreId: (0, pg_core_1.uuid)("genre_id")
        .references(() => genre_model_1.default.id)
        .notNull(),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.bookId, table.genreId] })]);
exports.default = BookGenreTable;
//# sourceMappingURL=book-genre-model.js.map