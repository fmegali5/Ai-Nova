import express from "express";
import { getApiKeys, updateApiKeys } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/api-keys", protectRoute, getApiKeys);
router.put("/api-keys", protectRoute, updateApiKeys);

export default router;
