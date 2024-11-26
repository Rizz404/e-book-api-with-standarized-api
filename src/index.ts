import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import userRoutes from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";
import compression from "compression";
import http from "http";
import { pool } from "./config/database-config";

// * INIT
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const router = express.Router();

// * Middleware
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev"));
app.use("/api", router);

// * Routes
router.use("/users", userRoutes);
router.use("/auth", authRoutes);

// * Global Error Handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// * Server
server.listen(PORT, () =>
  console.log(`Server run on port http://localhost:${PORT}`),
);

// * Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server gracefully...");
  server.close(() => {
    console.log("All connections closed. Server shut down.");
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received (Ctrl+C). Closing server gracefully...");
  console.log("Close database pool");
  await pool.end();
  server.close(() => {
    console.log("All connections closed. Server shut down.");
  });
});
