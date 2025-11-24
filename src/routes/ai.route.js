import express from "express";
import {
  setAIConfig,
  getAIConfig,
  chatWithAI,
  translateMessage,
  summarizeConversation,
  suggestReply,
} from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/config", setAIConfig);
router.get("/config", getAIConfig);
router.post("/chat", chatWithAI);
router.post("/translate", translateMessage);
router.post("/summarize", summarizeConversation);
router.post("/suggest-reply", suggestReply);

export default router;
