// socket.auth.middleware.js (SESSION VERSION)
import User from "../models/User.js";
import session from "express-session";
import connectMongo from "connect-mongo";
import { ENV } from "../lib/env.js";

const MongoStore = connectMongo.create({
  mongoUrl: ENV.MONGO_URI,
  collectionName: "sessions",
});

// Extract and parse cookie
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, v.join("=")];
    })
  );
}

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);

    const sessionId = cookies["connect.sid"];
    if (!sessionId) {
      console.log("❌ Socket rejected — no session cookie");
      return next(new Error("Unauthorized"));
    }

    // decode sessionId (express-session encodes it like: s:xxxxx.sig)
    const rawId = sessionId.startsWith("s:")
      ? sessionId.split(".")[0].slice(2)
      : sessionId;

    // Load session from Mongo
    const sessionData = await MongoStore.get(rawId);
    if (!sessionData || !sessionData.user) {
      console.log("❌ Socket rejected — invalid session");
      return next(new Error("Unauthorized"));
    }

    const userId = sessionData.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log("❌ Socket rejected — user not found");
      return next(new Error("Unauthorized"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`✅ Socket authenticated → ${user.fullName}`);

    next();
  } catch (error) {
    console.log("❌ Socket Auth Error:", error.message);
    next(new Error("Unauthorized"));
  }
};
