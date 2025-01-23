// * Default namanya sama kaya keynya jadi untuk yang lebih dari
// * satu kata buat pake snake case

import AuthorFollowModel from "../api/author-follows/author-follow.model";
import AuthorModel from "../api/authors/author.model";
import BookGenreModel from "../api/book-genres/book-genre.model";
import BookPictureModel from "../api/book-pictures/book-picture.model";
import BookReviewModel from "../api/book-reviews/book-review.model";
import BookWishlistModel from "../api/book-wishlist/book-wishlist.model";
import BookModel, { enumBookStatus } from "../api/books/book.model";
import CartModel from "../api/cart/cart.model";
import CartItemModel from "../api/cart-items/cart-item.model";
import GenreFollowModel from "../api/genre-follows/genre-follow.model";
import GenreModel from "../api/genres/genre.model";
import LanguageModel from "../api/languages/language.model";
import OrderModel, { enumShippingStatus } from "../api/orders/order.model";
import PaymentMethodModel from "../api/payment-methods/payment-method.model";
import PublisherFollowModel from "../api/publisher-follows/publisher-follow.model";
import PublisherModel from "../api/publishers/publisher.model";
import ShippingServiceModel from "../api/shipping-services/shipping-service.model";
import TransactionModel, {
  enumPaymentStatus,
} from "../api/transactions/transaction.model";
import UserAddressModel from "../api/user-addresses/user-address.model";
import UserFollowModel from "../api/user-follows/user-follow.model";
import UserPreferedLanguageModel from "../api/user-prefered-languages/user-prefered-language.model";
import UserProfileModel from "../api/user-profile/user-profile.model";
import UserModel, { enumRole } from "../api/users/user.model";

export {
  AuthorFollowModel,
  AuthorModel,
  BookGenreModel,
  BookModel,
  BookPictureModel,
  BookReviewModel,
  BookWishlistModel,
  CartItemModel,
  CartModel,
  enumBookStatus,
  enumPaymentStatus,
  enumRole,
  enumShippingStatus,
  GenreFollowModel,
  GenreModel,
  LanguageModel,
  OrderModel,
  PaymentMethodModel,
  PublisherFollowModel,
  PublisherModel,
  ShippingServiceModel,
  TransactionModel,
  UserAddressModel,
  UserFollowModel,
  UserModel,
  UserPreferedLanguageModel,
  UserProfileModel,
};
