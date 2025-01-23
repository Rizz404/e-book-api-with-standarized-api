import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createBookGenres,
  deleteBookGenre,
  getBookGenres,
} from "./book-genre.handler";

const router = express.Router();

router.route("/").post(authMiddleware(), createBookGenres);
router.route("/:bookId").get(getBookGenres);
router.route("/:bookId/:genreId").delete(authMiddleware(), deleteBookGenre);

export default router;
