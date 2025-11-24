// controllers/auth.controller.js
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { createSessionForUser, destroyUserSession } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { invalidateUserSession } from "../lib/socket.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sessionId = crypto.randomUUID();

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      currentSessionId: sessionId,
      lastLoginAt: new Date(),
    });

    const saved = await newUser.save();

    // 🔥 Create Session
    createSessionForUser(req, saved, sessionId);

    res.status(201).json({
      _id: saved._id,
      fullName: saved.fullName,
      email: saved.email,
      profilePic: saved.profilePic,
    });

    try {
      await sendWelcomeEmail(saved.email, saved.fullName, ENV.CLIENT_URL);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // 🔥 Invalidate old socket session
    invalidateUserSession(user._id.toString(), "Logged in from another device");

    // Generate new sessionId
    const newSessionId = crypto.randomUUID();

    user.currentSessionId = newSessionId;
    user.lastLoginAt = new Date();
    await user.save();

    // Create new Session
    createSessionForUser(req, user, newSessionId);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.session?.user) {
      await User.findByIdAndUpdate(req.session.user._id, {
        currentSessionId: null,
      });
    }

    await destroyUserSession(req);

    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.session.user._id;

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      ).select("-password");

      return res.status(200).json(updatedUser);
    }

    if (fullName) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName },
        { new: true }
      ).select("-password");

      return res.status(200).json(updatedUser);
    }

    return res.status(400).json({ message: "No data to update" });
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.session.user._id;

    if (!fullName || !email) {
      return res.status(400).json({ message: "Full name and email are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (email !== req.session.user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.session.user._id;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Error in changePassword controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
