import { faker } from "@faker-js/faker";
import { eq, or } from "drizzle-orm";

import db from "../../config/database-config";
import ShippingServiceModel from "./shipping.service.model";

const seedShippingServices = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const shippingServiceName = faker.word.noun();
      const shippingServiceCode = faker.color.human();

      // * Mulai sekarang pake select aja biar paham sql
      const existingShippingService = await db
        .select()
        .from(ShippingServiceModel)
        .where((table) =>
          or(
            eq(table.code, shippingServiceCode),
            eq(table.name, shippingServiceName),
          ),
        )
        .limit(1);

      if (existingShippingService.length > 0) {
        console.log(
          `ShippingService named ${shippingServiceName} already exist`,
        );
        continue;
      }

      await db.insert(ShippingServiceModel).values({
        code: shippingServiceCode,
        name: shippingServiceName,
      });
    }

    const shippingServices = await db.query.ShippingServiceModel.findMany();

    console.log(shippingServices);
  } catch (error) {
    console.log(error);
  }
};

export default seedShippingServices;
