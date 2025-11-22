import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  addReaction,
  handleVoiceCommand,  // ✅ NEW - Voice AI
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

// EXISTING ROUTES
router.put("/edit/:id", editMessage);
router.delete("/delete/:id", deleteMessage);
router.put("/read/:id", markAsRead);
router.post("/react/:id", addReaction);

// ✅ NEW - Voice Assistant Route
router.post("/voice", handleVoiceCommand);

export default router;
