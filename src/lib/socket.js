import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";

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
  if (socket.isGuest) {
    console.log("👤 Guest user connected:", socket.id);
  } else {
    onlineUsers.set(socket.userId, socket.id);
    console.log(`✅ User ${socket.user.fullName} is online`);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  }

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    if (socket.isGuest) {
      console.log("👋 Guest user disconnected:", socket.id);
    } else {
      onlineUsers.delete(socket.userId);
      console.log(`👋 User ${socket.user.fullName} disconnected`);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    }
  });

  // ✅ Send message event
  socket.on("sendMessage", (data) => {
    if (socket.isGuest) {
      return socket.emit("error", { 
        message: "Authentication required to send messages" 
      });
    }

    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", data);
    }
  });

  // ✅ Typing indicator
  socket.on("typing", (data) => {
    if (socket.isGuest) return;

    const recipientSocketId = onlineUsers.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("userTyping", {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    }
  });
});

export { app, server, io };
