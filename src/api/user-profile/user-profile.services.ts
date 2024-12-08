import { eq } from "drizzle-orm";

import db from "../../config/database.config";
import UserProfileModel, { InsertUserProfileDTO } from "./user-profile.model";

export const createUserProfileService = async (userId: string) => {
  return await db.insert(UserProfileModel).values({ userId }).returning();
};

export const findUserProfileByUserIdService = async (userId: string) => {
  return (
    await db
      .select()
      .from(UserProfileModel)
      .where(eq(UserProfileModel.userId, userId))
      .limit(1)
  )[0];
};

export const updateUserProfileService = async (
  userId: string,
  userProfileData: Partial<InsertUserProfileDTO>,
) => {
  const { bio } = userProfileData;
  const updateData = {
    ...(bio !== undefined && { bio }),
  };

  if (Object.keys(updateData).length === 0) {
    return findUserProfileByUserIdService(userId);
  }

  return (
    await db
      .update(UserProfileModel)
      .set(updateData)
      .where(eq(UserProfileModel.userId, userId))
      .returning()
  )[0];
};
