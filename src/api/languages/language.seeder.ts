import { faker } from "@faker-js/faker";
import { eq, or } from "drizzle-orm";

import db from "../../config/database-config";
import LanguageModel from "./language.model";

const seedLanguages = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const languageName = faker.word.noun();
      const languageCode = faker.color.human();

      // * Mulai sekarang pake select aja biar paham sql
      const existingLanguage = await db
        .select()
        .from(LanguageModel)
        .where((table) =>
          or(eq(table.code, languageCode), eq(table.name, languageName)),
        )
        .limit(1);

      if (existingLanguage.length > 0) {
        console.log(`Language named ${languageName} already exist`);
        continue;
      }

      await db.insert(LanguageModel).values({
        code: languageCode,
        name: languageName,
      });
    }

    const languages = await db.query.LanguageModel.findMany();

    console.log(languages);
  } catch (error) {
    console.log(error);
  }
};

export default seedLanguages;
