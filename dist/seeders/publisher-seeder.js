"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const database_config_1 = __importDefault(require("../config/database-config"));
const publisher_model_1 = __importDefault(require("../models/publisher-model"));
const drizzle_orm_1 = require("drizzle-orm");
const seedPublishers = async () => {
    try {
        for (let i = 1; i <= 10; i++) {
            const publisherName = faker_1.faker.book.publisher();
            // * Mulai sekarang pake select aja biar paham sql
            const existingPublisher = await database_config_1.default
                .select()
                .from(publisher_model_1.default)
                .where((table) => (0, drizzle_orm_1.eq)(table.name, publisherName))
                .limit(1);
            if (existingPublisher.length > 0) {
                console.log(`Publisher named ${publisherName} already exist`);
                continue;
            }
            await database_config_1.default.insert(publisher_model_1.default).values({
                name: publisherName,
                email: faker_1.faker.internet.email(),
                description: faker_1.faker.lorem.text(),
                website: [faker_1.faker.internet.domainName()],
            });
        }
        const publishers = await database_config_1.default.query.PublisherTable.findMany();
        console.log(publishers);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = seedPublishers;
//# sourceMappingURL=publisher-seeder.js.map