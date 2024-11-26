"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const database_config_1 = __importDefault(require("../config/database-config"));
const user_model_1 = __importDefault(require("../models/user-model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedUsers = async () => {
    try {
        const salt = await bcrypt_1.default.genSalt();
        const hashedPassword = await bcrypt_1.default.hash("177013", salt);
        for (let i = 1; i <= 10; i++) {
            await database_config_1.default.insert(user_model_1.default).values({
                username: faker_1.faker.internet.username(),
                email: faker_1.faker.internet.email(),
                password: hashedPassword,
                role: "USER",
            });
        }
        const users = await database_config_1.default.query.UserTable.findMany();
        console.log(users);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = seedUsers;
//# sourceMappingURL=user-seeder.js.map