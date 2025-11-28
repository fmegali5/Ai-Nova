// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;

    // ✅ لو مفيش في الكوكيز، جرّب Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      console.log("🔴 Auth Error: No token provided");
      return res.status(401).json({
        message: "Unauthorized - No token provided",
        shouldLogout: true,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET);
    } catch (jwtError) {
      console.log("🔴 JWT Verification Error:", jwtError.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        shouldLogout: true,
      });
    }

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
        shouldLogout: true,
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("🔴 User not found:", decoded.userId);
      return res.status(404).json({
        message: "User not found",
        shouldLogout: true,
      });
    }

    // ✅ CHECK SESSION ID
    if (user.currentSessionId !== decoded.sessionId) {
      console.log("🔴 Session Mismatch:", {
        userSession: user.currentSessionId,
        tokenSession: decoded.sessionId,
      });
      return res.status(401).json({
        message: "Session expired - Logged in from another device",
        shouldLogout: true,
        reason: "ANOTHER_SESSION",
      });
    }

    console.log("✅ Auth Verified:", { userId: user._id, email: user.email });
    req.user = user;
    next();
  } catch (error) {
    console.log("❌ Error in protectRoute middleware:", error.message);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
        shouldLogout: true,
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
