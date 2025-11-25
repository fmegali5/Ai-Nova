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
import User from "../models/User.js";

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

// ✅ Google Sign In - استخدم google-signin strategy
router.get(
  "/google",
  passport.authenticate("google-signin", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google-signin", { session: false }, async (err, user, info) => {
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      
      try {
        // ✅ لو في error
        if (err) {
          console.error("❌ Error in Google Sign In:", err);
          return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
        }

        // ✅ لو مفيش user (تم رفض التسجيل)
        if (!user) {
          const errorType = info?.message || "auth_failed";
          console.log("❌ Sign in rejected:", errorType);
          
          // ✅ امسح الـ session
          req.logout((logoutErr) => {
            if (logoutErr) {
              console.error("Logout error:", logoutErr);
            }
          });
          
          return res.redirect(`${FRONTEND_URL}/login?error=${errorType}`);
        }

        // ✅ المستخدم موجود - كمّل التسجيل
        const newSessionId = crypto.randomUUID();
        
        user.currentSessionId = newSessionId;
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
          { 
            userId: user._id,
            sessionId: newSessionId 
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.redirect(`${FRONTEND_URL}/auth/google/success?token=${token}`);
        
      } catch (error) {
        console.error("❌ Error in Google callback:", error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }
    })(req, res, next);
  }
);

// ✅ Google Sign Up - استخدم google-signup strategy
router.get(
  "/google/signup",
  passport.authenticate("google-signup", { scope: ["profile", "email"] })
);

router.get(
  "/google/signup/callback",
  (req, res, next) => {
    passport.authenticate("google-signup", { session: false }, async (err, user, info) => {
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      
      try {
        // ✅ لو في error
        if (err) {
          console.error("❌ Error in Google Sign Up:", err);
          return res.redirect(`${FRONTEND_URL}/signup?error=auth_failed`);
        }

        // ✅ لو مفيش user (تم رفض التسجيل)
        if (!user) {
          const errorType = info?.message || "auth_failed";
          console.log("❌ Sign up rejected:", errorType);
          
          // ✅ امسح الـ session
          req.logout((logoutErr) => {
            if (logoutErr) {
              console.error("Logout error:", logoutErr);
            }
          });
          
          return res.redirect(`${FRONTEND_URL}/signup?error=${errorType}`);
        }

        // ✅ تحقق لو المستخدم موجود من قبل
        const existingCheck = await User.findOne({ 
          googleId: user.googleId,
          _id: { $ne: user._id }
        });
        
        if (existingCheck) {
          console.log("⚠️ User already exists");
          
          // ✅ امسح الـ session
          req.logout((logoutErr) => {
            if (logoutErr) {
              console.error("Logout error:", logoutErr);
            }
          });
          
          return res.redirect(`${FRONTEND_URL}/signup?error=already_exists`);
        }

        // ✅ المستخدم جديد - كمّل التسجيل
        const newSessionId = crypto.randomUUID();
        user.currentSessionId = newSessionId;
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
          { 
            userId: user._id,
            sessionId: newSessionId 
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.redirect(`${FRONTEND_URL}/auth/google/success?token=${token}`);

      } catch (error) {
        console.error("❌ Error in Google Sign Up callback:", error);
        res.redirect(`${FRONTEND_URL}/signup?error=auth_failed`);
      }
    })(req, res, next);
  }
);

// ✅ Google Token Verification Route
router.post("/google/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ message: "Invalid session" });
    }

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      isPremium: user.isPremium,
      isAdmin: user.isAdmin,
    });

  } catch (error) {
    console.error("❌ Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
