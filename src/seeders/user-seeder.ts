import { faker } from "@faker-js/faker";
import db from "../config/database-config";
import UserTable from "../models/user-model";
import bcrypt from "bcrypt";

const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash("177013", salt);

    for (let i = 1; i <= 10; i++) {
      await db.insert(UserTable).values({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        role: "USER",
      });
    }

    const users = await db.query.UserTable.findMany();

    console.log(users);
  } catch (error) {
    console.log(error);
  }
};

export default seedUsers;
