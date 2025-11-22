import User from "../models/User.js";

export const getApiKeys = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (req.user.email !== "admin@gmail.com") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("apiKeys");
    
    res.status(200).json(user?.apiKeys || {
      mistralKey: "",
      grokKey: "",
      deepseekKey: "",
      tongyiKey: "",
    });
  } catch (error) {
    console.log("Error in getApiKeys:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateApiKeys = async (req, res) => {
  try {
    const { mistralKey, grokKey, deepseekKey, tongyiKey } = req.body;
    const userId = req.user._id;

    if (req.user.email !== "admin@gmail.com") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        apiKeys: {
          mistralKey: mistralKey || "",
          grokKey: grokKey || "",
          deepseekKey: deepseekKey || "",
          tongyiKey: tongyiKey || "",
        }
      },
      { new: true }
    ).select("apiKeys");

    res.status(200).json({ message: "API keys updated successfully" });
  } catch (error) {
    console.log("Error in updateApiKeys:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
