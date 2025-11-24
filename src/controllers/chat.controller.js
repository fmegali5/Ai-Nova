import Chat from "../models/Chat.js";

// جيب كل المحادثات للـ user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select("title messages model createdAt updatedAt");

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in getUserChats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// إنشاء محادثة جديدة
export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, messages, model } = req.body;

    if (!title || !messages || messages.length === 0) {
      return res.status(400).json({ message: "Title and messages are required" });
    }

    const newChat = new Chat({
      userId,
      title,
      messages,
      model: model || "Mistral"
    });

    await newChat.save();

    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error in createChat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// تحديث محادثة موجودة
export const updateChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { messages, title } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (messages) {
      chat.messages = messages;
    }

    if (title) {
      chat.title = title;
    }

    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in updateChat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// حذف محادثة
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error in deleteChat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// جيب محادثة واحدة
export const getChatById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error in getChatById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
