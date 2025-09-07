import express from "express";
import getUser from "../middleware/auth.middleware";
import { getUserInfo, getUserSearch } from "../controllers/user.controller";
const router = express.Router();

router.get("/me", getUser, getUserInfo);
router.put("/search", getUser, getUserSearch);

export default router;
