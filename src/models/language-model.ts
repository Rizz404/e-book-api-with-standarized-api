import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

const LanguageTable = pgTable(
  "languages",
  {
    id: uuid().primaryKey().defaultRandom(),
    code: varchar({ length: 20 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
  },
  (table) => [uniqueIndex().on(table.code), uniqueIndex().on(table.name)]
);

export default LanguageTable;
