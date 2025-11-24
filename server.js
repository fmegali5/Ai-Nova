// src/server.js
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
import { app as socketApp, server as socketServer, initSocket } from "./lib/socket.js";
import { Server as IOServer } from "socket.io";

console.log("SESSION_SECRET VALUE:", ENV.SESSION_SECRET);

const PORT = ENV.PORT || 5001;

// Allowed origins for CORS (update if you add more environments)
const allowedOrigins = [
  "http://localhost:5173",
  "https://ainoova.netlify.app"
];

const app = express(); // main express app (we'll use socketServer for sockets)

// -------------------- Middlewares --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Flexible CORS that accepts no-origin (for tools like Postman) and known origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// -------------------- Start Server --------------------
const startServer = async () => {
  try {
    // connect to Mongo
    await connectDB();
    console.log("MongoDB Connected");

    // Important for some hosting environments (Railway, Heroku) behind proxy/load balancer
    app.set("trust proxy", 1);

    // -------------------- Session Middleware --------------------
    // Create one session middleware instance and reuse it for express + socket.io
    const sessionMiddleware = session({
      secret: ENV.SESSION_SECRET || "change-me-in-prod",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        touchAfter: 24 * 3600,
        collectionName: "sessions",
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: "none", // required for cross-site cookies (Netlify <-> Railway)
        secure: ENV.NODE_ENV === "production", // send cookie only over HTTPS in prod
      },
    });

    // Attach session to express
    app.use(sessionMiddleware);

    // Passport (if used)
    app.use(passport.initialize());
    app.use(passport.session());

    // -------------------- Routes --------------------
    app.use("/api/auth", authRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/chat", chatRoutes);

    // Health check endpoints
    app.get("/", (req, res) =>
      res.json({
        status: "ok",
        message: "Backend running",
        timestamp: new Date().toISOString(),
      })
    );

    app.get("/health", (req, res) => res.json({ status: "healthy" }));

    // -------------------- Socket.IO Setup --------------------
    // create socket.io server using the socketServer imported from ./lib/socket.js
    // (we create a new instance here so we can attach the already-configured HTTP server)
    const io = new IOServer(socketServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // helper to wrap express middleware for socket.io
    const wrap = (middleware) => (socket, next) =>
      middleware(socket.request, {}, next);

    // use same session + passport middlewares in socket context
    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    // initialize socket handlers (initSocket expects the io instance)
    initSocket(io);

    // -------------------- Start Listening --------------------
    socketServer.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Server running on port:", PORT);
      console.log("📍 Environment:", ENV.NODE_ENV);
      console.log("🌐 Client URL:", ENV.CLIENT_URL);
      console.log("💾 Session Store: MongoDB");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Failed to start server:", error.message || error);
    console.error(error);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(1);
  }
};

startServer();
