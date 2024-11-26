"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const database_config_1 = __importDefault(require("../config/database-config"));
const genre_model_1 = __importDefault(require("../models/genre-model"));
const drizzle_orm_1 = require("drizzle-orm");
const seedGenres = async () => {
    try {
        for (let i = 1; i <= 10; i++) {
            const genreName = faker_1.faker.book.genre();
            const existingGenre = await database_config_1.default
                .select()
                .from(genre_model_1.default)
                .where((table) => (0, drizzle_orm_1.eq)(table.name, genreName))
                .limit(1);
            if (existingGenre.length > 0) {
                console.log(`Genre "${genreName}" sudah ada, tidak ditambahkan.`);
                continue;
            }
            await database_config_1.default.insert(genre_model_1.default).values({
                name: genreName,
                description: faker_1.faker.lorem.text(),
            });
        }
        const genres = await database_config_1.default.query.GenreTable.findMany();
        console.log(genres);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = seedGenres;
//# sourceMappingURL=genre-seeder.js.map