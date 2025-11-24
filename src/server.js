// server.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
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

// ✅ Trust Proxy - CRITICAL for Railway
app.set("trust proxy", 1);

// ✅ MIDDLEWARE - لازم يكون قبل الـ Routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ✅ CORS Configuration مع دومين Netlify
app.use(cors({
  origin: [
    "http://localhost:5173", // Development
    "https://ainoova.netlify.app", // Production - Netlify
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Session Middleware مع MongoDB Store للـ Production
app.use(
  session({
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: ENV.NODE_ENV === "production" 
      ? MongoStore.create({
          mongoUrl: ENV.MONGODB_URI,
          touchAfter: 24 * 3600,
        })
      : undefined,
    cookie: {
      secure: ENV.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
      domain: undefined,
    },
  })
);

// ✅ Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
    session: req.session ? "active" : "inactive",
    cookies: req.cookies ? Object.keys(req.cookies) : [],
  });
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "AI Nova API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      messages: "/api/messages",
      ai: "/api/ai",
      admin: "/api/admin",
      chat: "/api/chat"
    }
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(ENV.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ✅ Start Server Function
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${ENV.NODE_ENV}`);
      console.log(`🔐 Trust Proxy: ${app.get("trust proxy")}`);
      console.log(`🌐 CORS enabled for:`);
      console.log(`   - http://localhost:5173 (Development)`);
      console.log(`   - https://ainoova.netlify.app (Production)`);
      console.log(`🍪 Cookie Settings:`);
      console.log(`   - sameSite: ${ENV.NODE_ENV === "production" ? "none" : "lax"}`);
      console.log(`   - secure: ${ENV.NODE_ENV === "production"}`);
      console.log(`🔗 Health check: /api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// ✅ Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

startServer();
