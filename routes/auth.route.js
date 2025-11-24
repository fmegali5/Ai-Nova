import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

/*
|--------------------------------------------------------------------------
| AUTH (LOCAL)
|--------------------------------------------------------------------------
*/

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.put("/update-settings", protectRoute, updateSettings);
router.put("/change-password", protectRoute, changePassword);

router.get("/check", protectRoute, (req, res) =>
  res.status(200).json(req.user)
);

/*
|--------------------------------------------------------------------------
| GOOGLE AUTH
|--------------------------------------------------------------------------
*/

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
      // Generate Session
      const newSessionId = crypto.randomUUID();
      req.user.currentSessionId = newSessionId;
      req.user.lastLoginAt = new Date();
      await req.user.save();

      // Sign JWT
      const token = jwt.sign(
        {
          userId: req.user._id,
          sessionId: newSessionId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set Cookie (IMPORTANT FOR NETLIFY + RAILWAY)
      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.redirect(process.env.CLIENT_URL);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

export default router;
