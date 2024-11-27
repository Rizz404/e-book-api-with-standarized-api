import { and, SQL } from "drizzle-orm";

type Filter<T> = (table: T) => SQL | undefined;

export const addFilters = <T>(
  table: T,
  conditions: (Filter<T> | undefined)[],
): SQL | undefined => {
  // * Hanya gunakan kondisi yang tidak undefined
  const validConditions = conditions.filter(Boolean);

  if (validConditions.length === 0) return undefined;

  return and(...validConditions.map((filter) => filter!(table)));
};
