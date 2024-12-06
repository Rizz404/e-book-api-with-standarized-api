import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v1.0.0",
    title: "E-Book Api",
    description:
      "API untuk mengelola e-book, mencakup autentikasi pengguna, katalog e-book, pembelian, dan notifikasi. Dibangun dengan Express.js dan TypeScript untuk performa yang aman dan skalabel.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Masih lokal bang",
    },
  ],
  components: {},
};

const outputFile = "../../swagger.json";
const endpointsFiles = ["./src/routes.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
