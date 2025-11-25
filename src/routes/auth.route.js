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

// ✅ Google OAuth Routes - Sign In (يرفض إنشاء حساب جديد)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=signup_required`, // ✅ FRONTEND_URL
    session: false 
  }),
  async (req, res) => {
    try {
      const newSessionId = crypto.randomUUID();
      
      req.user.currentSessionId = newSessionId;
      req.user.lastLogin = new Date();
      await req.user.save();

      const token = jwt.sign(
        { 
          userId: req.user._id,
          sessionId: newSessionId 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      
      res.redirect(`${FRONTEND_URL}/auth/google/success?token=${token}`);
      
    } catch (error) {
      console.error("❌ Error in Google callback:", error);
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// ✅ Google OAuth Routes - Sign Up (يسمح بإنشاء حساب جديد)
router.get(
  "/google/signup",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/signup/callback",
  async (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, user, info) => {
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      
      try {
        if (err) {
          console.error("❌ Error in Google Sign Up:", err);
          return res.redirect(`${FRONTEND_URL}/signup?error=auth_failed`);
        }

        // ✅ لو المستخدم موجود بالفعل
        if (user) {
          console.log("⚠️ User already exists:", user.email);
          return res.redirect(`${FRONTEND_URL}/signup?error=already_exists`);
        }

        // ✅ المستخدم مش موجود - نعمل حساب جديد
        const profile = req.user || info?.profile;
        
        if (!profile) {
          return res.redirect(`${FRONTEND_URL}/signup?error=auth_failed`);
        }

        // ✅ إنشاء المستخدم الجديد
        const newUser = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails[0].value,
          profilePic: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
          password: null,
        });

        console.log("✅ Created new Google user:", newUser.email);

        const newSessionId = crypto.randomUUID();
        newUser.currentSessionId = newSessionId;
        newUser.lastLogin = new Date();
        await newUser.save();

        const token = jwt.sign(
          { 
            userId: newUser._id,
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
