import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import compression from "compression";
import http from "http";
import { pool } from "./config/database-config";
import logger from "./utils/logger";
import limiter from "./config/limiter-config";
import routes from "./routes";

// * INIT
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// * Middleware (Urutannya gini yang bener)
app.use(compression()); // * Kompresi di awal
app.use(morgan("dev")); // * Logging di awal untuk development
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// * Routes
app.use("/api", routes);

app.use(limiter); // * Rate limiting setelah routing

// * Global Error Handlers
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// * Server
server.listen(PORT, () => {
  logger.info(`Server run on port http://localhost:${PORT}`);
});

// * Database
pool.on("connect", () => logger.info("Koneksi baru ke database dibuat!"));
pool.on("remove", () => logger.info("Koneksi dihapus dari pool."));
pool.on("error", (err) => logger.error("Error di pool:", err));

// * Graceful Shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Closing server gracefully...");
  server.close(() => {
    logger.info("All connections closed. Server shut down.");
  });
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received (Ctrl+C). Closing server gracefully...");
  logger.info("Close database pool");
  await pool.end();
  server.close(() => {
    logger.info("All connections closed. Server shut down.");
  });
});

export default app;
