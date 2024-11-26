import { faker } from "@faker-js/faker";
import db from "../config/database-config";
import AuthorTable from "../models/author-model";
import { eq } from "drizzle-orm";

const seedAuthors = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const authorName = faker.book.author();

      // * Mulai sekarang pake select aja biar paham sql
      const existingAuthor = await db
        .select({ name: AuthorTable.name })
        .from(AuthorTable)
        .where((table) => eq(table.name, authorName))
        .limit(1);

      if (existingAuthor.length > 0) {
        console.log(`Author named ${authorName} already exist`);
        continue;
      }

      await db.insert(AuthorTable).values({
        // @ts-expect-error : Ngak tau kenapa ini
        name: authorName,
        birthDate: faker.date.birthdate(),
        deathDate: faker.date.future(),
        biography: faker.lorem.text(),
      });
    }

    const authors = await db.query.AuthorTable.findMany({
      columns: { name: true },
    });

    console.log(authors);
  } catch (error) {
    console.log(error);
  }
};

export default seedAuthors;
