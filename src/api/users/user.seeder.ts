import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import db from "../../config/database.config";
import UserProfileModel from "../user-profile/user-profile.model";
import UserModel from "./user.model";

const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash("177013", salt);

    for (let i = 1; i <= 10; i++) {
      // Insert user
      const user = await db
        .insert(UserModel)
        .values({
          username: faker.internet.username(),
          email: faker.internet.email(),
          password: hashedPassword,
          role: "USER",
        })
        .returning({
          id: UserModel.id,
        });

      // Insert profile for the user
      if (user[0]) {
        await db.insert(UserProfileModel).values({
          userId: user[0].id,
          bio: faker.lorem.sentence(),
          age: faker.number.int({ min: 12, max: 90 }),
        });
      }
    }

    const users = await db.query.UserModel.findMany();
    const profiles = await db.query.UserProfileModel.findMany();

    console.log("Users:", users);
    console.log("Profiles:", profiles);
  } catch (error) {
    console.log(error);
  }
};

export default seedUsers;
