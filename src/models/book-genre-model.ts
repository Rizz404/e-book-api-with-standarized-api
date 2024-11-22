import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import BookTable from "./book-model";
import GenreTable from "./genre-model";

const BookGenreTable = pgTable(
  "book_genre",
  {
    bookId: uuid("book_id")
      .references(() => BookTable.id)
      .notNull(),
    genreId: uuid("genre_id")
      .references(() => GenreTable.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.bookId, table.genreId] })]
);

export default BookGenreTable;
