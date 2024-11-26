// * Default namanya sama kaya keynya jadi untuk yang lebih dari
// * satu kata buat pake snake case
import UserTable, { enumRole } from "../models/user-model";
import UserProfileTable from "../models/user-profile-model";
import BookTable, { enumBookStatus } from "../models/book-model";
import BookPictureTable from "../models/book-picture-model";
import GenreTable from "../models/genre-model";
import BookGenreTable from "../models/book-genre-model";
import AuthorTable from "../models/author-model";
import BookReviewTable from "../models/book-review-model";
import LanguageTable from "../models/language-model";
import PublisherTable from "../models/publisher-model";

export {
  UserTable,
  UserProfileTable,
  BookTable,
  BookPictureTable,
  GenreTable,
  BookGenreTable,
  AuthorTable,
  BookReviewTable,
  LanguageTable,
  PublisherTable,
  enumRole,
  enumBookStatus,
};
