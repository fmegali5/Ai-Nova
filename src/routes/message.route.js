import express from "express";
import {
  getAllContacts,
  getChatPartners,  // ✅ أضف هنا
  getMessagesByUserId,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  addReaction,
  handleVoiceCommand,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// ✅ طبّق middleware على كل الـ routes
router.use(arcjetProtection);
router.use(protectRoute);

// Routes
router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

// Message management routes
router.put("/edit/:id", editMessage);
router.delete("/delete/:id", deleteMessage);
router.put("/read/:id", markAsRead);
router.post("/react/:id", addReaction);

// Voice assistant route
router.post("/voice", handleVoiceCommand);

export default router;
