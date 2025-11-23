// server.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";  // ✅ إضافة جديدة
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

// ✅ MIDDLEWARE - لازم يكون قبل الـ Routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// ✅ Session Middleware with MongoDB Store (لازم قبل passport)
app.use(
  session({
    secret: ENV.SESSION_SECRET || "your-session-secret-change-this",
    resave: false,
    saveUninitialized: false,
    // ✅ MongoDB Session Store - الإضافة المهمة
    store: MongoStore.create({
      mongoUrl: ENV.MONGODB_URI,
      touchAfter: 24 * 3600, // lazy session update (24 hours)
      crypto: {
        secret: ENV.SESSION_SECRET || "your-session-secret-change-this"
      },
      collectionName: 'sessions', // اسم الـ collection في MongoDB
      ttl: 7 * 24 * 60 * 60 // 7 days (same as cookie maxAge)
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ✅ Passport Middleware (بعد session)
app.use(passport.initialize());
app.use(passport.session());

// ✅ ROUTES - بعد الـ Middleware
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Production deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// ✅ UPDATED: Connect to MongoDB FIRST, then start server
const startServer = async () => {
  try {
    // ✅ Wait for MongoDB connection first
    await connectDB();
    
    // ✅ Then start server
    server.listen(PORT, () => {
      console.log("✅ Server running on port:", PORT);
      console.log("📍 Environment:", ENV.NODE_ENV);
      console.log("🌐 Client URL:", ENV.CLIENT_URL);
      console.log("💾 Session Store: MongoDB"); // ✅ رسالة جديدة
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
