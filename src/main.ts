import "dotenv/config";

import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import path from "path";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";

import swaggerOutput from "../swagger.json";
import { pool } from "./config/database.config";
import RATE_LIMITER_OPTION from "./constants/limiter.constants";
import apiKeyMiddleware from "./middleware/api-key.middleware";
import apiLimiterMiddleware from "./middleware/api-limiter.middleware";
import routes from "./routes";
import logger from "./utils/logger.utils";

// * INIT
const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5000" },
});

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
// app.use(apiKeyMiddleware);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/index.html"));
});
app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/api_page.html"));
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
app.use("/api", routes);

app.use(apiLimiterMiddleware(RATE_LIMITER_OPTION.api)); // * Rate limiting setelah routing

// * Global Error Handlers
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// * Server
io.on("connection", (socket) => {
  logger.info(`Socket connected`);
  socket.emit("hello", "world");

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected`);
  });
});

httpServer.listen(PORT, () => {
  logger.info(`Server run on port http://localhost:${PORT}`);
});

// * Database
pool.on("connect", () => logger.info("Koneksi baru ke database dibuat!"));
pool.on("remove", () => logger.info("Koneksi dihapus dari pool."));
pool.on("error", (err) => logger.error("Error di pool:", err));

// * Graceful Shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Closing httpServer gracefully...");
  httpServer.close(() => {
    logger.info("All connections closed. Server shut down.");
  });
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received (Ctrl+C). Closing httpServer gracefully...");
  logger.info("Close database pool");
  await pool.end();
  httpServer.close(() => {
    logger.info("All connections closed. Server shut down.");
  });
});

export default app;
