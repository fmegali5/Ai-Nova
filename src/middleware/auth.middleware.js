import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // ✅ محاولة 1: استخرج token من cookies
    const cookieToken = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    // ✅ محاولة 2: استخرج token من auth object
    const authToken = socket.handshake.auth?.token;

    // ✅ اختار أي token موجود
    const token = cookieToken || authToken;

    // ✅ إذا مفيش token - السماح بالاتصال كـ guest
    if (!token) {
      console.log("⚠️ Socket connection without token - Allowing as guest user");
      socket.user = null;
      socket.userId = null;
      socket.isGuest = true;
      return next();
    }

    // ✅ Verify the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      console.log("⚠️ Invalid token - Allowing as guest user");
      socket.user = null;
      socket.userId = null;
      socket.isGuest = true;
      return next();
    }

    // ✅ Find the user from DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("⚠️ User not found in DB - Allowing as guest user");
      socket.user = null;
      socket.userId = null;
      socket.isGuest = true;
      return next();
    }

    // ✅ Attach authenticated user info to socket
    socket.user = user;
    socket.userId = user._id.toString();
    socket.isGuest = false;

    console.log(`✅ Socket authenticated for user: ${user.fullName} (${user._id})`);

    next();
  } catch (error) {
    // ✅ في حالة أي خطأ - السماح بالاتصال كـ guest
    console.log("⚠️ Error in socket authentication:", error.message);
    console.log("→ Allowing connection as guest user");
    
    socket.user = null;
    socket.userId = null;
    socket.isGuest = true;
    
    next();
  }
};
