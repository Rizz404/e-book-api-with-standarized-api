import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
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

import AuthorModel from "../authors/author.model";
import LanguageModel from "../languages/language.model";
import PublisherModel from "../publishers/publisher.model";
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
    price: decimal({ precision: 10, scale: 2 })
      .notNull()
      .default("0.00")
      .$type<number>(),
    stock: integer().notNull().default(0),
    status: enumBookStatus().default("AVAILABLE"),
    fileUrl: varchar("file_url", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),

    // * Denormalisasi
    wishlistCount: integer("wishlist_count").notNull().default(0),
  },
  // * Nama boleh ada yang sama tapi slugnya tidak, karena ditambah seller username
  (table) => [
    index().on(table.title),
    uniqueIndex().on(table.slug),
    uniqueIndex().on(table.isbn),
  ],
);

export type InsertBookDTO = InferInsertModel<typeof BookModel>;
export type SelectBookDTO = InferSelectModel<typeof BookModel>;

export default BookModel;
