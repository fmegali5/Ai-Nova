import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://ai-nova-production.up.railway.app/api/auth/google/callback"
          : "http://localhost:5001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        const existingEmail = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingEmail) {
          return done(null, false, {
            message:
              "This email is already registered with a password. Please login instead.",
          });
        }

        user = await User.create({
          googleId: profile.id,
          fullName: profile.displayName,
          email: profile.emails[0].value,
          profilePic: profile.photos?.[0]?.value || "",
          password: null,
        });

        done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        done(err, null);
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
  } catch (err) {
    done(err, null);
  }
});

export default passport;
