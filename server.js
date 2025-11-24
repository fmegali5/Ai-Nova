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

console.log("SESSION_SECRET VALUE:", ENV.SESSION_SECRET);

const PORT = ENV.PORT || 5001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://ainoova.netlify.app"
];

// 🔹 Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 🔹 CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    // 🔥 أهم خطوة لتفعيل الكوكيز على Railway/Netlify
    app.set("trust proxy", 1);

    // 🔹 Session
    app.use(
      session({
        secret: ENV.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client: mongoose.connection.getClient(),
          touchAfter: 24 * 3600,
          collectionName: "sessions",
        }),
        cookie: {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        },
      })
    );

    // 🔹 Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // 🔹 Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/ai", aiRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/chat", chatRoutes);

    // 🔹 Health check
    app.get("/", (req, res) =>
      res.json({
        status: "ok",
        message: "Backend running",
        timestamp: new Date().toISOString(),
      })
    );

    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("Server start error:", error);
    process.exit(1);
  }
};

startServer();
