// routes/auth.route.js

import express from "express";
import passport from "../lib/passport.config.js";

import {
  signup,
  login,
  logout,
  updateProfile,
  updateSettings,
  changePassword,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ---------------- AUTH BASIC ----------------
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-settings", protectRoute, updateSettings);
router.put("/change-password", protectRoute, changePassword);

// ---------------- CHECK SESSION ----------------
router.get("/check", protectRoute, (req, res) => {
  res.status(200).json(req.user);
});

// ---------------- GOOGLE AUTH ----------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=email_exists`,
    session: false,
  }),
  async (req, res) => {
    try {
      // ❌ شيلنا السطر اللي كان فيه خطأ
      // const crypto from "crypto";

      const newSessionId = crypto.randomUUID();

      req.user.currentSessionId = newSessionId;
      req.user.lastLoginAt = new Date();
      await req.user.save();

      res.cookie("connect.sid", req.sessionID, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

// ---------------- EXPORT ----------------
export default router;
