import express from "express";

import authRoutes from "./api/auth/auth.routes";
import authorRoutes from "./api/author/author.routes";
import userRoutes from "./api/users/user.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/authors", authorRoutes);

export default router;
