import {
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import AuthorModel from "../author/author.model";
import { sql } from "drizzle-orm";
import PublisherModel from "../publishers/publisher.model";
import LanguageModel from "../languages/language.model";
import UserModel from "../users/user.model";

export const enumBookStatus = pgEnum("book_status", [
  "AVAILABLE",
  "SOLD",
  "ARCHIVED",
]);

const BookModel = pgTable(
  "books",
  {
    id: uuid().primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .references(() => AuthorModel.id)
      .notNull(),
    sellerId: uuid("seller_id")
      .references(() => UserModel.id)
      .notNull(),
    publisherId: uuid("publisher_id")
      .references(() => PublisherModel.id)
      .notNull(),
    languageId: uuid("language_id")
      .references(() => LanguageModel.id)
      .notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    publicationDate: date("publication_date").notNull(),
    slug: varchar().notNull(),
    isbn: varchar().notNull(),
    price: decimal({ precision: 10, scale: 2 }).notNull().default("0.00"),
    stock: integer().notNull().default(0),
    status: enumBookStatus().default("AVAILABLE"),
    fileUrl: varchar("file_url", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  // * Nama boleh ada yang sama tapi slugnya tidak, karena ditambah seller username
  (table) => [index().on(table.title), uniqueIndex().on(table.slug)],
);

export default BookModel;
