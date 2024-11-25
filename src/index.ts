import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import "dotenv/config";
import userRoutes from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";

// * INIT
const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router();

// * Middleware
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api", router);

// * Routes
router.use("/users", userRoutes);
router.use("/auth", authRoutes);

// * Server
app.listen(PORT, () => console.log(`Server run on port ${PORT}`));
