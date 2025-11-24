export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ 
        message: "Unauthorized - No token provided",
        shouldLogout: true 
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ 
        message: "Unauthorized - Invalid token",
        shouldLogout: true 
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        shouldLogout: true 
      });
    }

    // CHECK SESSION
    if (user.currentSessionId !== decoded.sessionId) {
      return res.status(401).json({ 
        message: "Session expired - Logged in from another device",
        shouldLogout: true,
        reason: "ANOTHER_SESSION"
      });
    }

    // ⬅⬅⬅ أهم تعديل
    req.user = {
      userId: user._id.toString(),
      sessionId: decoded.sessionId,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    };

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired token",
        shouldLogout: true,
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
