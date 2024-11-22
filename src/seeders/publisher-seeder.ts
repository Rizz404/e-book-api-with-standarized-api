import { faker } from "@faker-js/faker";
import db from "../config/database-config";
import PublisherTable from "../models/publisher-model";
import { eq } from "drizzle-orm";

const seedPublishers = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const publisherName = faker.book.publisher();

      // * Mulai sekarang pake select aja biar paham sql
      const existingPublisher = await db
        .select()
        .from(PublisherTable)
        .where((table) => eq(table.name, publisherName))
        .limit(1);

      if (existingPublisher.length > 0) {
        console.log(`Publisher named ${publisherName} already exist`);
        continue;
      }

      await db.insert(PublisherTable).values({
        name: publisherName,
        email: faker.internet.email(),
        description: faker.lorem.text(),
        website: [faker.internet.domainName()],
      });
    }

    const publishers = await db.query.PublisherTable.findMany();

    console.log(publishers);
  } catch (error) {
    console.log(error);
  }
};

export default seedPublishers;
