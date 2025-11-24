const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const router = express.Router();

// --- LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    req.session.userId = user._id;

    return res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// --- CHECK AUTH ---
router.get("/check", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    userId: req.session.userId
  });
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out" });
  });
});

module.exports = router;
