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
    failureRedirect: "/login?error=signup_required", // ✅ غيّر الـ error
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

      // ✅ حدد الـ Frontend URL
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      
      // ✅ أرسل الـ token في الـ URL
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
      try {
        if (err) {
          console.error("❌ Error in Google Sign Up:", err);
          const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
          return res.redirect(`${FRONTEND_URL}/signup?error=auth_failed`);
        }

        // ✅ لو المستخدم موجود بالفعل
        if (user) {
          console.log("⚠️ User already exists:", user.email);
          const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
          return res.redirect(`${FRONTEND_URL}/signup?error=already_exists`);
        }

        // ✅ المستخدم مش موجود - نعمل حساب جديد
        const profile = req.user || info?.profile;
        
        if (!profile) {
          const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
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

        // ✅ Generate Session ID
        const newSessionId = crypto.randomUUID();
        newUser.currentSessionId = newSessionId;
        newUser.lastLogin = new Date();
        await newUser.save();

        // ✅ Generate JWT token
        const token = jwt.sign(
          { 
            userId: newUser._id,
            sessionId: newSessionId 
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${FRONTEND_URL}/auth/google/success?token=${token}`);

      } catch (error) {
        console.error("❌ Error in Google Sign Up callback:", error);
        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
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

    // ✅ تحقق من الـ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ جيب المستخدم من الـ database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ تحقق من الـ sessionId
    if (user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // ✅ احفظ الـ cookie من الـ backend
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ ارجع بيانات المستخدم
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
