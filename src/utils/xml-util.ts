import { Builder, Options as XML2JSOptions } from "xml2js";
import { Request, Response } from "express";
import { APIResponse } from "./api-response-util";

const convertToXML = (obj: any): string => {
  const builder = new Builder({
    rootName: "response",
    xmldec: { version: "1.0", encoding: "UTF-8" },
    renderOpts: { pretty: true, indent: "  " },
    cdata: true,
  });

  return builder.buildObject(obj);
};

export default convertToXML;

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
