import express from "express";
import { 
  signup, 
  login, 
  logout, 
  updateProfile, 
  updateSettings, 
  changePassword 
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import passport from "../lib/passport.config.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-settings", protectRoute, updateSettings);
router.put("/change-password", protectRoute, changePassword);
router.get("/check", protectRoute, (req, res) => {
  res.status(200).json(req.user);
});

// ✅ Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/login?error=email_exists",
    session: false 
  }),
  async (req, res) => {
    try {
      // ✅ Generate Session ID
      const newSessionId = crypto.randomUUID();
      
      // ✅ Update user
      req.user.currentSessionId = newSessionId;
      req.user.lastLogin = new Date();
      await req.user.save();

      // ✅ Generate JWT token
      const token = jwt.sign(
        { 
          userId: req.user._id,
          sessionId: newSessionId 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ Set cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // ✅ حدد الـ Frontend URL
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      
      // ✅ حوّل للـ chat page
      res.redirect(`${FRONTEND_URL}/chat`);
      
    } catch (error) {
      console.error("❌ Error in Google callback:", error);
      res.redirect("/login?error=auth_failed");
    }
  }
);

export default router;
