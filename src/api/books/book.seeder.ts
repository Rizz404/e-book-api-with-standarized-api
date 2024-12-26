import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import db from "../../config/database.config";
import AuthorModel from "../authors/author.model";
import BookGenreModel from "../book-genre/book-genre.model";
import BookPictureModel from "../book-pictures/book-picture.model";
import BookModel from "../books/book.model";
import GenreModel from "../genres/genre.model";
import LanguageModel from "../languages/language.model";
import PublisherModel from "../publishers/publisher.model";
import UserModel from "../users/user.model";

const seedBooks = async () => {
  try {
    // Fetch all related data from other tables
    const authors = await db.select().from(AuthorModel);
    const sellers = await db.select().from(UserModel);
    const publishers = await db.select().from(PublisherModel);
    const languages = await db.select().from(LanguageModel);
    const genres = await db.select().from(GenreModel);
    const pictures = [
      "https://i.pinimg.com/236x/28/a5/38/28a53818427467bceef016911ed494b4.jpg",
      "https://i.pinimg.com/236x/3a/dc/ff/3adcff7a670cde2ea2bb8ceadb6cceac.jpg",
      "https://i.pinimg.com/236x/bf/fa/8e/bffa8e997ba9f1873ec570000ae713c6.jpg",
      "https://i.pinimg.com/474x/b0/fe/07/b0fe079f98dcb49c0b1c3e18abacdab6.jpg",
      "https://i.pinimg.com/236x/28/27/77/2827771068d374a49d2c0fa49d30967d.jpg",
      "https://i.pinimg.com/236x/80/94/4c/80944c40ae2a175a14b0e1ac5f7ec21d.jpg",
      "https://i.pinimg.com/474x/6d/d9/f4/6dd9f4f17cfb7b675b6571d18c78506e.jpg",
      "https://i.pinimg.com/236x/52/d3/4e/52d34ede46b02cc70c1f5eb4eec2e59d.jpg",
      "https://i.pinimg.com/236x/ca/9f/51/ca9f51799b5dd4625beb7cd3549e65cf.jpg",
      "https://i.pinimg.com/474x/c8/40/4a/c8404a3376fac98a20099a9d6fb650fe.jpg",
    ];

    if (
      !authors.length ||
      !sellers.length ||
      !publishers.length ||
      !languages.length ||
      !genres.length
    ) {
      throw new Error("Ada yang null tuh atau gak ada data");
    }

    for (let i = 1; i <= 10; i++) {
      const bookTitle = faker.book.title();

      const existingBook = await db
        .select()
        .from(BookModel)
        .where((table) => eq(table.title, bookTitle))
        .limit(1);

      if (existingBook.length > 0) {
        console.log(`Book ${bookTitle}" already exists, skipping.`);
        continue;
      }

      // Randomly pick IDs from related tables
      const authorId = authors[Math.floor(Math.random() * authors.length)].id;
      const sellerId = sellers[Math.floor(Math.random() * sellers.length)].id;
      const publisherId =
        publishers[Math.floor(Math.random() * publishers.length)].id;
      const languageId =
        languages[Math.floor(Math.random() * languages.length)].id;
      const slug = `seller_${sellers[Math.floor(Math.random() * sellers.length)].username}_${bookTitle.split(" ").join("_")}`;

      // Insert book
      const newBook = await db
        .insert(BookModel)
        .values({
          // @ts-expect-error : author babi gak jelas
          authorId,
          sellerId,
          publisherId,
          languageId,
          title: bookTitle,
          description: faker.lorem.paragraphs(),
          publicationDate: faker.date.past(),
          slug,
          isbn: faker.commerce.isbn(),
          price: faker.commerce.price(),
          stock: faker.number.int({ min: 1, max: 100 }),
        })
        .returning();

      const bookId = newBook[0].id;

      // * Insert book genre
      const genreCount = faker.number.int({ min: 3, max: 7 });
      const selectedGenres = faker.helpers.arrayElements(genres, genreCount);

      for (const genre of selectedGenres) {
        await db.insert(BookGenreModel).values({
          bookId,
          genreId: genre.id,
        });
      }

      // * Insert book picture
      const pictureCount = faker.number.int({ min: 1, max: 7 });
      const selectedPictures = faker.helpers.arrayElements(
        pictures,
        pictureCount,
      );

      for (const picture of selectedPictures) {
        await db.insert(BookPictureModel).values({ bookId, url: picture });
      }

      console.log(`Book "${bookTitle}" inserted with ID: ${bookId}`);
    }

    console.log("Book seeding completed!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
};

export default seedBooks;
