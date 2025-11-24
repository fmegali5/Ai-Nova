// lib/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// Apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// ✅ أولاً: عرّف userSocketMap
const userSocketMap = {}; // {userId: socketId}

// ✅ ثانياً: ثم عرّف الـ functions
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ✅ Function to invalidate user session
export function invalidateUserSession(userId, message = "Logged in from another device") {
  const socketId = userSocketMap[userId];
  if (socketId) {
    console.log(`🔴 Invalidating session for user: ${userId}`);
    // Send session revoked event to the specific socket
    io.to(socketId).emit("SESSION_REVOKED", {
      message,
      reason: "ANOTHER_SESSION",
    });
    // Remove user from socket map
    delete userSocketMap[userId];
  }
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.userId);
  
  const userId = socket.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
