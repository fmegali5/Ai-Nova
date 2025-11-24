// src/lib/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";
import { ENV } from "./env.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://ainoova.netlify.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// ✅ Socket Authentication Middleware
io.use(socketAuthMiddleware);

// ✅ Store online users
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("🔌 New socket connection:", socket.id);

  // ✅ Handle authenticated users only
  if (socket.userId) {
    onlineUsers.set(socket.userId, socket.id);
    console.log(`✅ User ${socket.userId} is online`);

    // Broadcast online users to all connected clients
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  } else {
    console.log("👤 Guest user connected:", socket.id);
  }

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`👋 User ${socket.userId} disconnected`);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    } else {
      console.log("👋 Guest user disconnected:", socket.id);
    }
  });

  // ✅ Custom event example
  socket.on("sendMessage", (data) => {
    if (!socket.userId) {
      return socket.emit("error", { message: "Authentication required" });
    }

    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", data);
    }
  });
});

export { app, server, io };
