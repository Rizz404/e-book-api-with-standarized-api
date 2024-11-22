import { Builder, Options as XML2JSOptions } from "xml2js";

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
