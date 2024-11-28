import crypto from "crypto";
import { Response } from "express";

import { API_VERSION, TRACE_ID_PREFIX } from "../constants/api-constants";

export interface APIMetadata {
  version: string;
  timestamp: string;
  trace_id?: string;
  pagination?: PaginationMetadata;
}

export interface APIResponse<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta: APIMetadata;
}

export interface PaginationMetadata {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  previousPage: number | null;
  nextPage: number | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMetadata;
}

const generateTraceId = () => {
  const timestamp = Date.now().toString(36); // * Base36 untuk kompres timestamp
  const randomPart = crypto.randomBytes(8).toString("hex").slice(0, 8);

  return `${TRACE_ID_PREFIX}-${timestamp}-${randomPart}`;
};

const createMetadata = (includedTraceId = false): APIMetadata => {
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

export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedData<T> => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items: data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
};

export const createSuccessResponse = <T extends object>(
  res: Response,
  data: T | PaginatedData<T> | undefined,
  message = "success",
  statusCode = 200,
) => {
  const meta: APIMetadata = {
    ...createMetadata(),
  };

  if (data !== undefined && "pagination" in data) {
    meta.pagination = data.pagination;
  }

  const apiResponse: APIResponse<T | T[]> = {
    status: true,
    statusCode,
    message,
    ...(data !== undefined && {
      data: "pagination" in data ? (data as PaginatedData<T>).items : data,
    }),
    meta,
  };

  res.status(statusCode).json(apiResponse);
};

export const createErrorResponse = (
  res: Response,
  message: unknown,
  statusCode = 500,
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
