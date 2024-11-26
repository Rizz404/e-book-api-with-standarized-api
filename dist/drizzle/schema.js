"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumBookStatus = exports.enumRole = exports.PublisherTable = exports.LanguageTable = exports.BookReviewTable = exports.AuthorTable = exports.BookGenreTable = exports.GenreTable = exports.BookPictureTable = exports.BookTable = exports.UserProfileTable = exports.UserTable = void 0;
// * Default namanya sama kaya keynya jadi untuk yang lebih dari
// * satu kata buat pake snake case
const user_model_1 = __importStar(require("../models/user-model"));
exports.UserTable = user_model_1.default;
Object.defineProperty(exports, "enumRole", { enumerable: true, get: function () { return user_model_1.enumRole; } });
const user_profile_model_1 = __importDefault(require("../models/user-profile-model"));
exports.UserProfileTable = user_profile_model_1.default;
const book_model_1 = __importStar(require("../models/book-model"));
exports.BookTable = book_model_1.default;
Object.defineProperty(exports, "enumBookStatus", { enumerable: true, get: function () { return book_model_1.enumBookStatus; } });
const book_picture_model_1 = __importDefault(require("../models/book-picture-model"));
exports.BookPictureTable = book_picture_model_1.default;
const genre_model_1 = __importDefault(require("../models/genre-model"));
exports.GenreTable = genre_model_1.default;
const book_genre_model_1 = __importDefault(require("../models/book-genre-model"));
exports.BookGenreTable = book_genre_model_1.default;
const author_model_1 = __importDefault(require("../models/author-model"));
exports.AuthorTable = author_model_1.default;
const book_review_model_1 = __importDefault(require("../models/book-review-model"));
exports.BookReviewTable = book_review_model_1.default;
const language_model_1 = __importDefault(require("../models/language-model"));
exports.LanguageTable = language_model_1.default;
const publisher_model_1 = __importDefault(require("../models/publisher-model"));
exports.PublisherTable = publisher_model_1.default;
//# sourceMappingURL=schema.js.map