import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import db from "../../config/database-config";
import AuthorModel from "./author.model";

const seedAuthors = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const authorName = faker.book.author();

      // * Mulai sekarang pake select aja biar paham sql
      const existingAuthor = await db
        .select({ name: AuthorModel.name })
        .from(AuthorModel)
        .where((table) => eq(table.name, authorName))
        .limit(1);

      if (existingAuthor.length > 0) {
        console.log(`Author named ${authorName} already exist`);
        continue;
      }

      await db.insert(AuthorModel).values({
        // @ts-expect-error : Ngak tau kenapa ini
        name: authorName,
        birthDate: faker.date.birthdate(),
        deathDate: faker.date.future(),
        biography: faker.lorem.text(),
      });
    }

    const authors = await db.query.AuthorModel.findMany({
      columns: { name: true },
    });

    console.log(authors);
  } catch (error) {
    console.log(error);
  }
};

export default seedAuthors;
