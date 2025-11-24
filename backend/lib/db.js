// lib/db.js
import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");

    console.log("🔄 Connecting to MongoDB..."); // ✅ Add this log

    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // ✅ 30 seconds timeout
      socketTimeoutMS: 45000,           // ✅ 45 seconds socket timeout
    });
    
    console.log("✅ MONGODB CONNECTED:", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connection to MONGODB:", error.message);
    throw error; // ✅ Throw instead of process.exit (let startServer handle it)
  }
};
