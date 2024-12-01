import { and, between, count, desc, eq, SQL, sql } from "drizzle-orm";

import db from "../../config/database-config";
import LanguageModel from "../languages/language.model";
import UserPreferedLanguageModel, {
  InsertUserPreferedLanguageDTO,
} from "./user.prefered.language.model";

export const addUserPreferedLanguageService = async (
  userPreferedLanguageData: InsertUserPreferedLanguageDTO,
) => {
  return (
    await db
      .insert(UserPreferedLanguageModel)
      .values(userPreferedLanguageData)
      .returning()
  )[0];
};

export const findUserPreferedLanguagesFollowedService = async (
  userId: string,
  limit: string,
  offset: number,
) => {
  const filtersQuery = and(
    eq(UserPreferedLanguageModel.followedUserId, userId),
    eq(LanguageModel.id, UserPreferedLanguageModel.followingLanguageId),
  );

  const totalItemsQuery = await db
    .select({ count: count() })
    .from(UserPreferedLanguageModel)
    .innerJoin(
      UserPreferedLanguageModel,
      eq(LanguageModel.id, UserPreferedLanguageModel.followingLanguageId),
    )
    .where(filtersQuery);

  const totalItems = totalItemsQuery[0]?.count || 0;

  const userPreferedLanguages = await db
    .select()
    .from(UserPreferedLanguageModel)
    .innerJoin(
      UserPreferedLanguageModel,
      eq(LanguageModel.id, UserPreferedLanguageModel.followingLanguageId),
    )
    .where(filtersQuery)
    .limit(parseInt(limit))
    .offset(offset);

  return { totalItems, userPreferedLanguages };
};

export const findFollowedUserPreferedLanguageService = async (
  userId: string,
  currentUserPreferedLanguageId: string,
) => {
  return (
    await db
      .select()
      .from(UserPreferedLanguageModel)
      .where(
        and(
          eq(UserPreferedLanguageModel.followingLanguageId, userId),
          eq(
            UserPreferedLanguageModel.followedUserId,
            currentUserPreferedLanguageId,
          ),
        ),
      )
  )[0];
};

// * * Gak usah returning kali, soalnya kan delete
export const removeUserPreferedLanguageService = async (
  userId: string,
  currentUserPreferedLanguageId: string,
) => {
  return await db
    .delete(UserPreferedLanguageModel)
    .where(
      and(
        eq(UserPreferedLanguageModel.followingLanguageId, userId),
        eq(
          UserPreferedLanguageModel.followedUserId,
          currentUserPreferedLanguageId,
        ),
      ),
    );
};
