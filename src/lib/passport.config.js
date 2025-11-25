import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

console.log("🔍 Checking Google OAuth Config:");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Found" : "❌ Missing");
console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Found" : "❌ Missing");
console.log("Backend URL:", process.env.BACKEND_URL || "http://localhost:5001");

// ✅ Strategy 1: للـ Sign In فقط (يرفض إنشاء حساب جديد)
passport.use(
  "google-signin",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("✅ Found existing Google user:", user.email);
          return done(null, user);
        }

        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          console.log("❌ Email exists with password login:", existingUser.email);
          return done(null, false, { 
            message: "email_exists"
          });
        }

        // ❌ المستخدم مش موجود - ارفض التسجيل
        console.log("❌ User not found - Sign up required:", profile.emails[0].value);
        return done(null, false, { 
          message: "signup_required"
        });

      } catch (error) {
        console.error("❌ Error in Google Sign In Strategy:", error);
        done(error, null);
      }
    }
  )
);

// ✅ Strategy 2: للـ Sign Up فقط (يسمح بإنشاء حساب جديد)
passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/signup/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ✅ ابحث عن المستخدم بالـ Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // ❌ المستخدم موجود بالفعل
          console.log("⚠️ User already exists:", user.email);
          return done(null, user); // نرجع المستخدم عشان نعرف إنه موجود
        }

        // ✅ تحقق من الإيميل
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          console.log("❌ Email already registered with password:", existingUser.email);
          return done(null, false, { 
            message: "already_exists"
          });
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
        done(null, newUser);

      } catch (error) {
        console.error("❌ Error in Google Sign Up Strategy:", error);
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
