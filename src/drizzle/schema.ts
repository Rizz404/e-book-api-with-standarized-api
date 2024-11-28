// * Default namanya sama kaya keynya jadi untuk yang lebih dari
// * satu kata buat pake snake case

import AuthorModel from "../api/author/author.model";
import BookPictureModel from "../api/book-pictures/book-picture.model";
import BookReviewModel from "../api/book-reviews/book-review.model";
import BookModel, { enumBookStatus } from "../api/books/book.model";
import GenreModel from "../api/genres/genre.model";
import LanguageModel from "../api/languages/language.model";
import PublisherModel from "../api/publishers/publisher.model";
import BookGenreModel from "../api/relations/book-genre.model";
import UserProfileModel from "../api/user-profile/user-profile.model";
import UserModel, { enumRole } from "../api/users/user.model";

export {
  AuthorModel,
  BookGenreModel,
  BookModel,
  BookPictureModel,
  BookReviewModel,
  enumBookStatus,
  enumRole,
  GenreModel,
  LanguageModel,
  PublisherModel,
  UserModel,
  UserProfileModel,
};
