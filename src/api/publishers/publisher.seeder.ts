import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import db from "../../config/database-config";
import PublisherModel from "./publisher.model";

const seedPublishers = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const publisherName = faker.book.publisher();

      // * Mulai sekarang pake select aja biar paham sql
      const existingPublisher = await db
        .select()
        .from(PublisherModel)
        .where((table) => eq(table.name, publisherName))
        .limit(1);

      if (existingPublisher.length > 0) {
        console.log(`Publisher named ${publisherName} already exist`);
        continue;
      }

      await db.insert(PublisherModel).values({
        name: publisherName,
        email: faker.internet.email(),
        description: faker.lorem.text(),
        website: [faker.internet.domainName()],
      });
    }

    const publishers = await db.query.PublisherModel.findMany();

    console.log(publishers);
  } catch (error) {
    console.log(error);
  }
};

export default seedPublishers;
