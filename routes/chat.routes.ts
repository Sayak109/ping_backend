import express from "express";
import getUser from "../middleware/auth.middleware";
import {
  getUserChatMessages,
  getUserChats,
  sendMessage,
  seenMessage,
} from "../controllers/chat.controller";
import { upload } from "../config/multer.config";

const router = express.Router();

router.get("/", getUser, getUserChats);
router.get("/messages/:id", getUser, getUserChatMessages);
router.post("/send-message/:id", upload.single("image"), getUser, sendMessage);
router.post("/message-seen/:id", getUser, seenMessage);

export default router;
