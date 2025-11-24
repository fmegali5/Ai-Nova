// lib/utils.js
import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res, sessionId) => {
  // Create JWT with userId + sessionId
  const token = jwt.sign(
    { userId, sessionId },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,            // REQUIRED for Railway HTTPS
    sameSite: "none",        // REQUIRED for Netlify → Railway cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
