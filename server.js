// server.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "./lib/passport.config.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import adminRoutes from "./routes/admin.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const PORT = ENV.PORT || 5001;

// ✅ Basic Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 🔥🔥 Updated CORS for Netlify + Localhost
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-nova.netlify.app", // ← حط رابط Netlify بعد ما ترفعه
    ],
    credentials: true,
  })
);

// ✅ Start Server Function
const startServer = async () => {
  try {
    // ✅ Step 1: Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    // ✅ Step 2: Setup Session Store
    app.use(
      session({
        secret: ENV.SESSION_SECRET || "your-session-secret-change-this",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: mongoose.connection.getClient(),
          touchAfter: 24 * 3600,
          crypto: {
            secret: ENV.SESSION_SECRET || "your-session-secret-change-this",
          },
          collectionName: "sessions",
          ttl: 7 * 24 * 60 * 60,
        }),
        cookie: {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        },
      })
    );
    console.log("✅ Session Store: MongoDB");

    // ✅ Step 3: Passport Middleware
    app.use(passport.initialize());
    app.use(passport.session());
    console.log("✅ Passport Initialized");

    // ✅ Step 4: API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/chat", chatRoutes);

    // ✅ Health Check Routes
    app.get("/", (req, res) => {
      res.json({
        status: "ok",
        message: "Backend API is running",
        timestamp: new Date().toISOString(),
      });
    });

    app.get("/health", (req, res) => {
      res.json({ status: "healthy" });
    });

    // ✅ Step 5: Start Server
    server.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Server running on port:", PORT);
      console.log("📍 Environment:", ENV.NODE_ENV);
      console.log("🌐 Client URL:", ENV.CLIENT_URL);
      console.log("💾 Session Store: MongoDB");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Failed to start server:", error.message);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(1);
  }
};

// ✅ Start the application
startServer();
