import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import aiRoutes from "./routes/ai.route.js";
import adminRoutes from "./routes/admin.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./lib/socket.js";

const app = express();
const server = http.createServer(app);

const PORT = ENV.PORT || 5001;

// -------------------- Allowed CORS Origins --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://ainoova.netlify.app",
];

// -------------------- CORS FIXED --------------------
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// -------------------- Middlewares --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// -------------------- Database --------------------
await connectDB();
console.log("MongoDB Connected");

// -------------------- Trust Proxy --------------------
app.set("trust proxy", 1);

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.send("Backend is running"));

// -------------------- SOCKET.IO --------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initSocket(io);

// -------------------- START --------------------
server.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 CLIENT_URL = ${ENV.CLIENT_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
