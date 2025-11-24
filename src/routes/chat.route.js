import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUserChats,
  createChat,
  updateChat,
  deleteChat,
  getChatById
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserChats);
router.get("/:chatId", protectRoute, getChatById);
router.post("/", protectRoute, createChat);
router.put("/:chatId", protectRoute, updateChat);
router.delete("/:chatId", protectRoute, deleteChat);

export default router;
