// src/server.js
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import adminRoutes from "./routes/admin.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

import http from "http";
import { initSocket } from "./lib/socket.js";   // مهم — مش Server من socket.io هنا

const app = express();
const server = http.createServer(app);

const PORT = ENV.PORT || 5001;

// ─────────────────────────────────────────
// 1) TRUST PROXY (لـ Railway)
// ─────────────────────────────────────────
app.set("trust proxy", 1);

// ─────────────────────────────────────────
// 2) COOKIE PARSER
// ─────────────────────────────────────────
app.use(cookieParser());

// ─────────────────────────────────────────
// 3) SESSION MIDDLEWARE (نحتاجه في socket.js)
// ─────────────────────────────────────────
const sessionMiddleware = session({
  secret: ENV.SESSION_SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: ENV.MONGO_URI,
    ttl: 7 * 24 * 60 * 60,
  }),
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".netlify.app",       // 🔥 يسمح للكوكيز تشتغل على Netlify
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

// Important: استخدمه قبل CORS
app.use(sessionMiddleware);

// ─────────────────────────────────────────
// 4) CORS
// ─────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://ainoova.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ─────────────────────────────────────────
// 5) BODY PARSERS
// ─────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─────────────────────────────────────────
// 6) DATABASE
// ─────────────────────────────────────────
await connectDB();
console.log("MongoDB Connected");

// ─────────────────────────────────────────
// 7) ROUTES
// ─────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.send("Backend Running ✔"));

// ─────────────────────────────────────────
// 8) SOCKET.IO
// ─────────────────────────────────────────
initSocket(server, sessionMiddleware); // ✔ تمرير السيرفر + السيشن بشكل صحيح

// ─────────────────────────────────────────
// 9) START SERVER
// ─────────────────────────────────────────
server.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 CLIENT_URL = ${ENV.CLIENT_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
