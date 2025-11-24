import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
// ... rest of your imports ...

import { app, server } from "./lib/socket.js";

app.set('trust proxy', 1); // هنا في الأعلى مهم جداً!!

const allowedOrigins = [
  'https://ainoova.netlify.app',  
  'http://localhost:5173'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// بقية الكود كما لديك ...
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const startServer = async () => {
  try {
    await connectDB();
    // ...
    app.use(
      session({
        secret: ENV.SESSION_SECRET || "your-session-secret-change-this",
        resave: false,
        saveUninitialized: false,
        proxy: true, // هنا!
        store: MongoStore.create({
          client: mongoose.connection.getClient(),
          touchAfter: 24 * 3600,
          crypto: {
            secret: ENV.SESSION_SECRET || "your-session-secret-change-this"
          },
          collectionName: "sessions",
          ttl: 7 * 24 * 60 * 60
        }),
        cookie: {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: ENV.NODE_ENV === "production" ? "none" : "lax"
        },
      })
    );
    // ... بقية كودك ...
  } catch (error) { /* ... */ }
};

startServer();

