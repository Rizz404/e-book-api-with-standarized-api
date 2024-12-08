import {
  Column,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
  SQLWrapper,
} from "drizzle-orm";

import db from "../../config/database.config";
import LanguageModel, {
  InsertLanguageDTO,
  SelectLanguageDTO,
} from "./language.model";

export const createLanguageService = async (
  languageData: InsertLanguageDTO,
) => {
  return (await db.insert(LanguageModel).values(languageData).returning())[0];
};

// * Urutannya SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET
export const findLanguagesByFiltersService = async (
  limit: string,
  offset: number,
  filters?: SQL<unknown>,
) => {
  const totalItems =
    (await db.select({ count: count() }).from(LanguageModel).where(filters))[0]
      .count || 0;
  const languages = await db
    .select()
    .from(LanguageModel)
    .where(filters)
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, languages };
};

export const findLanguagesLikeColumnService = async (
  limit: string,
  offset: number,
  column: Column,
  value: string | SQLWrapper,
) => {
  const totalItems =
    (
      await db
        .select({ count: count() })
        .from(LanguageModel)
        .where(ilike(column, `%${value}%`))
    )[0].count || 0;
  const languages = await db
    .select()
    .from(LanguageModel)
    .where(ilike(column, `%${value}%`))
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, languages };
};

export const findLanguageByIdService = async (id: string) => {
  return (
    await db
      .select()
      .from(LanguageModel)
      .where(eq(LanguageModel.id, id))
      .limit(1)
  )[0];
};

export const findLanguageByColumnService = async (name: string) => {
  return (
    await db
      .select()
      .from(LanguageModel)
      .where(or(eq(LanguageModel.name, name)))
      .limit(1)
  )[0];
};

export const updateLanguageService = async (
  languageId: string,
  languageData: Partial<InsertLanguageDTO>,
) => {
  const { name, code } = languageData;

  return (
    await db
      .update(LanguageModel)
      .set({
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
      })
      .where(eq(LanguageModel.id, languageId))
      .returning()
  )[0];
};

export const deleteLanguageService = async (languageId: string) => {
  return (
    await db
      .delete(LanguageModel)
      .where(eq(LanguageModel.id, languageId))
      .returning()
  )[0];
};
