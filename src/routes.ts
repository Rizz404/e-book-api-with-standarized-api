import express from "express";

import authRoutes from "./api/auth/auth.routes";
import authorFollowRoutes from "./api/author-follows/author.follow.routes";
import authorRoutes from "./api/authors/author.routes";
import bookPictureRoutes from "./api/book-pictures/book.picture.routes";
import bookReviewRoutes from "./api/book-reviews/book.review.routes";
import bookRoutes from "./api/books/book.routes";
import cartRoutes from "./api/cart/cart.routes";
import cartItemRoutes from "./api/cart-items/cart.item.routes";
import genreFollowRoutes from "./api/genre-follows/genre.follow.routes";
import genreRoutes from "./api/genres/genre.routes";
import languageRoutes from "./api/languages/language.routes";
import paymentMethodRoutes from "./api/payment-methods/payment.method.routes";
import publisherFollowRoutes from "./api/publisher-follows/publisher.follow.routes";
import publisherRoutes from "./api/publishers/publisher.routes";
import shippingServiceRoutes from "./api/shipping-services/shipping.service.routes";
import userFollowRoutes from "./api/user-follows/user.follow.routes";
import userPreferedLanguageRoutes from "./api/user-prefered-languages/user.prefered.language.routes";
import userRoutes from "./api/users/user.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/authors", authorRoutes);
router.use("/genres", genreRoutes);
router.use("/languages", languageRoutes);
router.use("/publishers", publisherRoutes);
router.use("/books", bookRoutes);
router.use("/carts", cartRoutes);
router.use("/cart-items", cartItemRoutes);
router.use("/bookPictures", bookPictureRoutes);
router.use("/bookReviews", bookReviewRoutes);
router.use("/author-follows", authorFollowRoutes);
router.use("/genre-follows", genreFollowRoutes);
router.use("/publisher-follows", publisherFollowRoutes);
router.use("/user-follows", userFollowRoutes);
router.use("/user-prefered-languages", userPreferedLanguageRoutes);
router.use("/payment-methods", paymentMethodRoutes);
router.use("/shipping-services", shippingServiceRoutes);

export default router;
