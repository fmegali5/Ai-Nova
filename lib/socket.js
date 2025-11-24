// lib/socket.js
import { Server } from "socket.io";

// خريطة لتخزين ال sockets
const userSocketMap = {}; 
let io = null;

// ─────────────────────────────────────────
// 🔥 لازم تلف الـ sessionMiddleware هنا
// ─────────────────────────────────────────
export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

// ─────────────────────────────────────────
// ⭐ initSocket — تُستدعى في server.js
// ─────────────────────────────────────────
export function initSocket(server, sessionMiddleware) {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://ainoova.netlify.app",
      ],
      credentials: true,
    },
  });

  // ربط الـ session بالـ sockets
  io.use(wrap(sessionMiddleware));

  // الاتصال
  io.on("connection", (socket) => {
    const sess = socket.request.session;

    if (!sess || !sess.user) {
      console.log("❌ Unauthorized socket, disconnecting...");
      socket.disconnect(true);
      return;
    }

    const user = sess.user;
    const userId = user._id;

    socket.userId = userId;
    socket.user = user;

    console.log(`⚡ User connected: ${user.fullName}`);

    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${user.fullName}`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

// ─────────────────────────────────────────
// لإرسال رسالة لمستخدم معيّن
// ─────────────────────────────────────────
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ─────────────────────────────────────────
// لطرد جلسة مستخدم (مثال: دخول من جهاز آخر)
// ─────────────────────────────────────────
export function invalidateUserSession(userId, message = "Logged in from another device") {
  const sid = userSocketMap[userId];
  if (sid && io) {
    io.to(sid).emit("SESSION_REVOKED", {
      message,
      reason: "ANOTHER_SESSION",
    });
  }
}

export { io };
