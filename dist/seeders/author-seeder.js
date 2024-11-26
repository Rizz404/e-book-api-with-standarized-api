"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const database_config_1 = __importDefault(require("../config/database-config"));
const author_model_1 = __importDefault(require("../models/author-model"));
const drizzle_orm_1 = require("drizzle-orm");
const seedAuthors = async () => {
    try {
        for (let i = 1; i <= 10; i++) {
            const authorName = faker_1.faker.book.author();
            // * Mulai sekarang pake select aja biar paham sql
            const existingAuthor = await database_config_1.default
                .select({ name: author_model_1.default.name })
                .from(author_model_1.default)
                .where((table) => (0, drizzle_orm_1.eq)(table.name, authorName))
                .limit(1);
            if (existingAuthor.length > 0) {
                console.log(`Author named ${authorName} already exist`);
                continue;
            }
            await database_config_1.default.insert(author_model_1.default).values({
                // @ts-expect-error
                name: authorName,
                birthDate: faker_1.faker.date.birthdate(),
                deathDate: faker_1.faker.date.future(),
                biography: faker_1.faker.lorem.text(),
            });
        }
        const authors = await database_config_1.default.query.AuthorTable.findMany({
            columns: { name: true },
        });
        console.log(authors);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = seedAuthors;
//# sourceMappingURL=author-seeder.js.map