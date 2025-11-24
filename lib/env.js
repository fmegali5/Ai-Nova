import "dotenv/config";

export const ENV = {
  // Server
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,

  // Database
  MONGO_URI: process.env.MONGO_URI,

  // Auth
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,

  // Client
  CLIENT_URL: process.env.CLIENT_URL,

  // Email / Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Arcjet
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // AI Provider
  AI_PROVIDER: process.env.AI_PROVIDER,
  AI_MODEL: process.env.AI_MODEL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
};
