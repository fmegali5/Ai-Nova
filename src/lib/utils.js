import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res, sessionId) => {
  // ✅ Token يحتوي على userId + sessionId
  const token = jwt.sign(
    { userId, sessionId },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax", // ✅ CRITICAL FIX
    secure: ENV.NODE_ENV === "production", // ✅ must be true with sameSite: none
  });

  return token;
};
