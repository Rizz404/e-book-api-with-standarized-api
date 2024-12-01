import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import db from "../../config/database-config";
import UserAddressModel from "./user.address.model";

const seedUserAddresss = async () => {
  try {
    for (let i = 1; i <= 10; i++) {
      const userAddressName = faker.book.userAddress();

      // * Mulai sekarang pake select aja biar paham sql
      const existingUserAddress = await db
        .select({ name: UserAddressModel.name })
        .from(UserAddressModel)
        .where((table) => eq(table.name, userAddressName))
        .limit(1);

      if (existingUserAddress.length > 0) {
        console.log(`UserAddress named ${userAddressName} already exist`);
        continue;
      }

      await db.insert(UserAddressModel).values({
        // @ts-expect-error : Ngak tau kenapa ini
        name: userAddressName,
        birthDate: faker.date.birthdate(),
        deathDate: faker.date.future(),
        biography: faker.lorem.text(),
      });
    }

    const userAddresss = await db.query.UserAddressModel.findMany({
      columns: { name: true },
    });

    console.log(userAddresss);
  } catch (error) {
    console.log(error);
  }
};

export default seedUserAddresss;
