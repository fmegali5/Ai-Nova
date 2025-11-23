// server.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
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

const __dirname = path.resolve();
const PORT = ENV.PORT || 5001;

// ✅ Basic Middleware (قبل كل حاجة)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// ✅ Start Server Function
const startServer = async () => {
  try {
    // ✅ Step 1: Connect to MongoDB FIRST
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    // ✅ Step 2: Setup Session Store (بعد MongoDB connection)
    app.use(
      session({
        secret: ENV.SESSION_SECRET || "your-session-secret-change-this",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: mongoose.connection.getClient(),
          touchAfter: 24 * 3600, // 24 hours
          crypto: {
            secret: ENV.SESSION_SECRET || "your-session-secret-change-this"
          },
          collectionName: "sessions",
          ttl: 7 * 24 * 60 * 60 // 7 days
        }),
        cookie: {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    // ✅ Step 5: Production Static Files
    if (ENV.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../frontend/dist")));
      app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
      });
    }

    // ✅ Step 6: Start Server
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
