import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import db from "../../config/database-config";
import UserModel from "./user.model";

const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash("177013", salt);

    for (let i = 1; i <= 10; i++) {
      await db.insert(UserModel).values({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: "USER",
      });
    }

    const users = await db.query.UserModel.findMany();

    console.log(users);
  } catch (error) {
    console.log(error);
  }
};

export default seedUsers;
