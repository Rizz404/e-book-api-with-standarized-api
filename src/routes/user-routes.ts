import express from "express";
import { getUsers } from "../controller/user-controller";

const router = express.Router();

router.route("/").get(getUsers);

export default router;
