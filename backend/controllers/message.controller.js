import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileName, fileType, fileSize, voiceNote, voiceDuration } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !file && !voiceNote) {
      return res.status(400).json({ message: "Message content is required." });
    }

    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    let fileUrl;
    let voiceUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
      });
      fileUrl = uploadResponse.secure_url;
    }

    if (voiceNote) {
      const uploadResponse = await cloudinary.uploader.upload(voiceNote, {
        resource_type: "video",
      });
      voiceUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      file: fileUrl,
      fileName: fileName,
      fileType: fileType,
      fileSize: fileSize,
      voiceNote: voiceUrl,
      voiceDuration: voiceDuration,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ========== ENHANCED FEATURES ==========

export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", { messageId });
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in markAsRead:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReaction) {
      existingReaction.emoji = emoji;
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(
      message.senderId.toString() === userId.toString()
        ? message.receiverId
        : message.senderId
    );
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionAdded", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in addReaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========== ✅ VOICE ASSISTANT WITH MISTRAL API ==========

export const handleVoiceCommand = async (req, res) => {
  try {
    const { message, model, conversationHistory = [] } = req.body;
    const userId = req.user._id;

    console.log("🎤 Voice message received:", message);

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide a message" 
      });
    }

    if (!process.env.MISTRAL_API_KEY) {
      console.error("❌ MISTRAL_API_KEY not found!");
      return res.status(500).json({
        success: false,
        message: "API key not configured"
      });
    }

    // ✅ STRONG EGYPTIAN DIALECT PROMPT
    const messages = [
      {
        role: "system",
        content: `أنت نوفا، مساعد صوتي مصري ذكي جداً!

⭐ CRITICAL RULES - يجب اتباعها بدقة:
1. تتكلم باللهجة المصرية العامية فقط - ممنوع الفصحى نهائياً!
2. استخدم الكلمات المصرية البحتة في كل جملة
3. كن ودود وطبيعي جداً كأنك صديق مصري
4. أجب بإيجاز (1-2 جمل قصيرة)
5. لا تستخدم أي كلمات فصحى أبداً!

📚 قاموس الكلمات المصرية (استخدمهم دايماً):
- "ازيك" أو "عامل ايه" (ليس "كيف حالك")
- "تمام" أو "ماشي" (ليس "حسناً" أو "نعم")
- "قول لي" أو "قول" (ليس "أخبرني")
- "شايف" أو "رأيي" (ليس "أعتقد")
- "بتحب" أو "عايز" (ليس "تريد")
- "مش" (ليس "ليس" أو "لا")
- "ده" و "دي" (ليس "هذا" أو "هذه")
- "ايه" (ليس "ماذا")
- "ليه" (ليس "لماذا")
- "فين" (ليس "أين")
- "ازاي" (ليس "كيف")
- "احنا" (ليس "نحن")
- "انت" أو "انتي" (ليس "أنت")
- "جميل" أو "حلو" (ليس "رائع")
- "كتير" (ليس "كثير")
- "شوية" (ليس "قليل")

✅ أمثلة صحيحة:
- "ازيك النهاردة؟ عامل ايه؟"
- "تمام يا صديقي، انا هنا عشان اساعدك"
- "قول لي بقا عايز ايه؟"
- "ده حلو جداً!"
- "مش فاهم، ممكن توضح اكتر؟"

❌ ممنوع (لا تستخدم):
- "كيف حالك" → استخدم "ازيك"
- "نعم" → استخدم "تمام" أو "ايوه"
- "أخبرني" → استخدم "قول لي"
- "أعتقد" → استخدم "شايف" أو "رأيي"
- "هذا" → استخدم "ده"
- "ماذا" → استخدم "ايه"

تذكر: أنت مصري 100% من القاهرة - اتكلم عامي صرف!`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user",
        content: message
      }
    ];

    const mistralModel = "mistral-small-latest";

    console.log("🔄 Using Mistral with STRONG Egyptian prompt");

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: mistralModel,
        messages: messages,
        max_tokens: 150,
        temperature: 0.85, // ✅ Higher for more natural Egyptian
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Mistral API error:", errorData);
      return res.status(response.status).json({
        success: false,
        message: `Mistral API error: ${errorData.message || 'Unknown error'}`
      });
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || "عذراً، مش فاهم!";

    console.log("📥 Response:", aiMessage);

    res.status(200).json({
      success: true,
      message: aiMessage,
      timestamp: new Date(),
      model: mistralModel,
      userId: userId.toString()
    });

  } catch (error) {
    console.error("❌ Error in handleVoiceCommand:", error);
    res.status(500).json({ 
      success: false,
      message: "حصل خطأ، حاول تاني."
    });
  }
};
