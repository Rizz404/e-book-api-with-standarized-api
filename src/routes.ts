import express from "express";

import authRoutes from "./api/auth/auth.routes";
import authorFollowRoutes from "./api/author-follows/author.follow.routes";
import authorRoutes from "./api/authors/author.routes";
import bookRoutes from "./api/books/book.routes";
import genreRoutes from "./api/genres/genre.routes";
import languageRoutes from "./api/languages/language.routes";
import publisherRoutes from "./api/publishers/publisher.routes";
import userRoutes from "./api/users/user.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/authors", authorRoutes);
router.use("/genres", genreRoutes);
router.use("/languages", languageRoutes);
router.use("/publishers", publisherRoutes);
router.use("/books", bookRoutes);
router.use("/author-follows", authorFollowRoutes);

export default router;
