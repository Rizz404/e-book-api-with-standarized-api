import { and, gte, lte, SQL } from "drizzle-orm";

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

export const dateRangeFilter = <T>(
  column: (table: T) => SQL,
  startDate?: string,
  endDate?: string,
) => {
  return (table: T) => {
    if (startDate && endDate) {
      return and(gte(column(table), startDate), lte(column(table), endDate));
    }
    if (startDate) {
      return gte(column(table), startDate);
    }
    if (endDate) {
      return lte(column(table), endDate);
    }
    return undefined;
  };
};
