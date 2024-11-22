import { API_VERSION, TRACE_ID_PREFIX } from "../constants/api-constants";
import crypto from "crypto";
import { Request, Response } from "express";
import convertToXML from "./convert-xml-util";

interface APIMetadata {
  version: string;
  timestamp: string;
  trace_id?: string;
}

interface APIResponse<T> {
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

// * Fungsi untuk menentukan format response berdasarkan Accept header
const getResponseFormat = (req: Request): "json" | "xml" => {
  const acceptHeader = req.headers.accept?.toLowerCase() || "";
  return acceptHeader.includes("application/xml") ? "xml" : "json";
};

export const sendResponse = async <T>(
  req: Request,
  res: Response,
  responseData: APIResponse<T>
): Promise<void> => {
  const format = getResponseFormat(req);

  res.setHeader(
    "Content-Type",
    format === "xml" ? "application/xml" : "application/json"
  );

  try {
    if (format === "xml") {
      const xmlResponse = convertToXML(responseData);
      res.send(xmlResponse);
    } else {
      res.json(responseData);
    }
  } catch (error) {
    // * Fallback ke JSON jika ada error dalam konversi XML
    console.error("Error converting response:", error);
    res.setHeader("Content-Type", "application/json");
    res.json(responseData);
  }
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

export const createSuccessResponse = async (
  req: Request,
  res: Response,
  data: any,
  message: string = "success",
  statusCode: number = 200
): Promise<void> => {
  const response: APIResponse<typeof data> = {
    status: true,
    statusCode,
    message,
    data,
    meta: createMetadata(),
  };

  await sendResponse(req, res, response);
};

export const createErrorResponse = async (
  req: Request,
  res: Response,
  message: unknown,
  statusCode: number = 500
): Promise<void> => {
  const response: APIResponse<never> = {
    status: true,
    statusCode,
    message: getErrorMessage(message),
    meta: createMetadata(),
  };

  await sendResponse(req, res, response);
};
