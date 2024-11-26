"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const database_config_1 = __importDefault(require("../config/database-config"));
const language_model_1 = __importDefault(require("../models/language-model"));
const drizzle_orm_1 = require("drizzle-orm");
const seedLanguages = async () => {
    try {
        for (let i = 1; i <= 10; i++) {
            const languageName = faker_1.faker.word.noun();
            const languageCode = faker_1.faker.color.human();
            // * Mulai sekarang pake select aja biar paham sql
            const existingLanguage = await database_config_1.default
                .select()
                .from(language_model_1.default)
                .where((table) => (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(table.code, languageCode), (0, drizzle_orm_1.eq)(table.name, languageName)))
                .limit(1);
            if (existingLanguage.length > 0) {
                console.log(`Language named ${languageName} already exist`);
                continue;
            }
            await database_config_1.default.insert(language_model_1.default).values({
                code: languageCode,
                name: languageName,
            });
        }
        const languages = await database_config_1.default.query.LanguageTable.findMany();
        console.log(languages);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = seedLanguages;
//# sourceMappingURL=language-seeder.js.map