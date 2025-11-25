import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

console.log("🔍 Checking Google OAuth Config:");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Found" : "❌ Missing");
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Found" : "❌ Missing");
console.log("Backend URL:", process.env.BACKEND_URL || "http://localhost:5001");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ✅ ابحث عن المستخدم بالـ Google ID أولاً
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // ✅ لو لقيت المستخدم بـ Google ID، خلاص موجود
          console.log("✅ Found existing Google user:", user.email);
          return done(null, user);
        }

        // ✅ لو مش موجود بـ Google ID، ابحث بالإيميل
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          // ❌ الإيميل موجود بالفعل لكن بدون Google ID (مسجل بـ password)
          console.log("❌ Email exists with password login:", existingUser.email);
          return done(null, false, { 
            message: "This email is already registered with a password. Please login with your password." 
          });
        }

        // ❌ المستخدم مش موجود خالص - ارفض التسجيل
        console.log("❌ User not found - Sign up required:", profile.emails[0].value);
        return done(null, false, { 
          message: "Account not found. Please sign up first." 
        });

      } catch (error) {
        console.error("❌ Error in Google Strategy:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error("❌ Error deserializing user:", error);
    done(error, null);
  }
});

export default passport;
