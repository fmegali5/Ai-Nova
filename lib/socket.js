// lib/socket.js
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { ENV } from "./env.js";

// نصدّر app و server لكن لن نربط io هنا مباشرة
const app = express();
const server = http.createServer(app);

// متغيرات لإدارة الـ sockets
let io = null;
const userSocketMap = {}; // { userId: socketId }

// initSocket : تستدعي من server.js بعدما تُركّب session middleware
export function initSocket(_io) {
  io = _io;

  io.on("connection", (socket) => {
    // socket.request.session يفترض أن يكون مُعدّ بواسطة wrap(sessionMiddleware)
    const s = socket.request?.session;
    if (!s || !s.user) {
      socket.disconnect(true);
      return;
    }

    const user = s.user;
    const userId = user._id;
    socket.userId = userId;
    socket.user = user;

    console.log("A user connected", user.fullName);

    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", user.fullName);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Send SESSION_REVOKED to the user's socket (if connected)
export function invalidateUserSession(userId, message = "Logged in from another device") {
  const sid = userSocketMap[userId];
  if (sid && io) {
    console.log(`🔴 Invalidating session for user: ${userId}`);
    io.to(sid).emit("SESSION_REVOKED", { message, reason: "ANOTHER_SESSION" });
  }
}

export { app, server, io };
