import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import db from "../../config/database.config";
import GenreModel from "./genre.model";

const seedGenres = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const genreName = faker.book.genre();

      const existingGenre = await db
        .select()
        .from(GenreModel)
        .where((table) => eq(table.name, genreName))
        .limit(1);

      if (existingGenre.length > 0) {
        console.log(`Genre "${genreName}" sudah ada, tidak ditambahkan.`);
        continue;
      }

      await db.insert(GenreModel).values({
        name: genreName,
        description: faker.lorem.text(),
      });
    }

    const genres = await db.query.GenreModel.findMany();

    console.log(genres);
  } catch (error) {
    console.log(error);
  }
};

export default seedGenres;
