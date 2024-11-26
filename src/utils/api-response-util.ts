import { API_VERSION, TRACE_ID_PREFIX } from "../constants/api-constants";
import crypto from "crypto";
import { Response } from "express";

export interface APIMetadata {
  version: string;
  timestamp: string;
  trace_id?: string;
}

export interface APIResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta: APIMetadata;
}

const generateTraceId = () => {
  const timestamp = Date.now().toString(36); // * Base36 untuk kompres timestamp
  const randomPart = crypto.randomBytes(8).toString("hex").slice(0, 8);

  return `${TRACE_ID_PREFIX}-${timestamp}-${randomPart}`;
};

const createMetadata = (includedTraceId: boolean = false): APIMetadata => {
  const metaData: APIMetadata = {
    version: API_VERSION,
    timestamp: new Date().toISOString(),
  };

  if (includedTraceId) {
    metaData.trace_id = generateTraceId();
  }

  return metaData;
};

export const getErrorMessage = (error: unknown) => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "An unknown error has occurred";
  }

  return message;
};

export const createSuccessResponse = <T>(
  res: Response,
  data: T,
  message: string = "success",
  statusCode: number = 200,
) => {
  const apiResponse: APIResponse<T> = {
    status: true,
    statusCode,
    message,
    data,
    meta: createMetadata(),
  };

  res.status(statusCode).json(apiResponse);
};

export const createErrorResponse = (
  res: Response,
  message: unknown,
  statusCode: number = 500,
  errors?: string[] | { message: string; type?: string }[],
) => {
  const apiResponse: APIResponse<never> = {
    status: false,
    statusCode,
    message: getErrorMessage(message),
    ...(errors && { errors }),
    meta: createMetadata(),
  };

  res.status(statusCode).json(apiResponse);
};
