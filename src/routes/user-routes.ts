import express from "express";
import { getUserById, getUsers } from "../controller/user-controller";
import { authMiddleware } from "../middleware/auth-middleware";

const router = express.Router();

router.route("/").get(authMiddleware({ authType: "required" }), getUsers);
router.route("/:userId").get(getUserById);

export default router;
