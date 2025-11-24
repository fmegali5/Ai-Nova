// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    apiKeys: {
      type: {
        mistralKey: { type: String, default: "" },
        grokKey: { type: String, default: "" },
        deepseekKey: { type: String, default: "" },
        tongyiKey: { type: String, default: "" },
      },
      default: {},
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // ✅ أضف دول للـ Single Session
    currentSessionId: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
