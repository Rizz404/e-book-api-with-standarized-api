import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const validatePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN as string, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN as string, {
    expiresIn: "30d",
  });
};

export const generateEmailConfirmationToken = (
  userId: string,
  email: string,
) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_EMAIL_CONFIRMATION_TOKEN as string,
    {
      expiresIn: "7h",
    },
  );
};

export const decodeAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string) as {
    userId: string;
  };
};

export const decodeRefreshToken = (refreshToken: string) => {
  return jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN as string) as {
    userId: string;
  };
};

export const decodeEmailConfirmationToken = (
  emailConfirmationToken: string,
) => {
  return jwt.verify(
    emailConfirmationToken,
    process.env.JWT_EMAIL_CONFIRMATION_TOKEN as string,
  ) as {
    userId: string;
    email: string;
  };
};
