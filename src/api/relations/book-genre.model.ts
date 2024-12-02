import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import BookModel from "../books/book.model";
import GenreModel from "../genres/genre.model";

const BookGenreModel = pgTable(
  "book_genre",
  {
    bookId: uuid("book_id")
      .references(() => BookModel.id)
      .notNull(),
    genreId: uuid("genre_id")
      .references(() => GenreModel.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.bookId, table.genreId] })],
);

export default BookGenreModel;
