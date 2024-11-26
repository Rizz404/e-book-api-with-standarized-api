"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const xml2js_1 = require("xml2js");
const convertToXML = (obj) => {
    const builder = new xml2js_1.Builder({
        rootName: "response",
        xmldec: { version: "1.0", encoding: "UTF-8" },
        renderOpts: { pretty: true, indent: "  " },
        cdata: true,
    });
    return builder.buildObject(obj);
};
exports.default = convertToXML;
// * Fungsi untuk menentukan format response berdasarkan Accept header
const getResponseFormat = (req) => {
    const acceptHeader = req.headers.accept?.toLowerCase() || "";
    return acceptHeader.includes("application/xml") ? "xml" : "json";
};
const sendResponse = async (req, res, responseData) => {
    const format = getResponseFormat(req);
    res.setHeader("Content-Type", format === "xml" ? "application/xml" : "application/json");
    try {
        if (format === "xml") {
            const xmlResponse = convertToXML(responseData);
            res.send(xmlResponse);
        }
        else {
            res.json(responseData);
        }
    }
    catch (error) {
        // * Fallback ke JSON jika ada error dalam konversi XML
        console.error("Error converting response:", error);
        res.setHeader("Content-Type", "application/json");
        res.json(responseData);
    }
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=xml-util.js.map