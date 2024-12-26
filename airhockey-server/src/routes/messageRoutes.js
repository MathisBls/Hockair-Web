import express from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
  getChatList,
  postMessage,
  deleteMessage,
  getLatestMessages
} from "../controllers/messageController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import Message from "../models/Message.js";


const router = express.Router();

router.post("/send", authenticateToken, sendMessage);

router.get("/:friendId", authenticateToken, getMessages);

router.put("/read", authenticateToken, markAsRead);

router.delete("/:messageId", authenticateToken, deleteMessage);

router.get("/latest", authenticateToken, getLatestMessages);

router.get("/", authenticateToken, getChatList);

router.post("/", authenticateToken, postMessage);


export default router;
