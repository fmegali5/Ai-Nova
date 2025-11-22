import axios from "axios";
import User from "../models/User.js";

// ✅ OpenRouter Base URL (لـ Grok, DeepSeek, Tongyi)
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// ✅ Mistral Base URL (الرسمي)
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1/chat/completions";

export const setAIConfig = async (req, res) => {
  try {
    const { apiKey, model, provider } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    res.status(200).json({ 
      message: "AI configuration updated successfully",
      provider: provider,
      model: model
    });
  } catch (error) {
    console.error("Error in setAIConfig:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAIConfig = async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: "admin@gmail.com" }).select("apiKeys");
    
    res.status(200).json({
      hasMistral: !!adminUser?.apiKeys?.mistralKey,
      hasGrok: !!adminUser?.apiKeys?.grokKey,
      hasDeepSeek: !!adminUser?.apiKeys?.deepseekKey,
      hasTongyi: !!adminUser?.apiKeys?.tongyiKey,
      isConfigured: !!(adminUser?.apiKeys?.mistralKey || adminUser?.apiKeys?.grokKey || adminUser?.apiKeys?.deepseekKey || adminUser?.apiKeys?.tongyiKey)
    });
  } catch (error) {
    console.error("Error in getAIConfig:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, model } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const adminUser = await User.findOne({ email: "admin@gmail.com" }).select("apiKeys");
    
    if (!adminUser || !adminUser.apiKeys) {
      return res.status(400).json({ 
        message: "AI is not configured. Please contact the administrator." 
      });
    }

    const { mistralKey, grokKey, deepseekKey, tongyiKey } = adminUser.apiKeys;

    let aiResponse;

    // ✅ Mistral - من الموقع الرسمي
    if (model === "Mistral" || model === "mistral") {
      if (!mistralKey) {
        return res.status(400).json({ message: "Mistral API key not configured." });
      }
      aiResponse = await chatWithMistral(message, [], mistralKey, "mistral-large-latest");
      
    // ✅ Grok - من OpenRouter
    } else if (model === "Grok 4.1 Fast" || model === "grok") {
      if (!grokKey) {
        return res.status(400).json({ message: "Grok API key not configured." });
      }
      aiResponse = await chatWithOpenRouter(message, [], grokKey, "x-ai/grok-4.1-fast:free");
      
    // ✅ DeepSeek - من OpenRouter
    } else if (model === "DeepSeek" || model === "deepseek") {
      if (!deepseekKey) {
        return res.status(400).json({ message: "DeepSeek API key not configured." });
      }
      aiResponse = await chatWithOpenRouter(message, [], deepseekKey, "deepseek/deepseek-chat");
      
    // ✅ Tongyi - من OpenRouter
    } else if (model === "Tongyi DeepResearch" || model === "tongyi") {
      if (!tongyiKey) {
        return res.status(400).json({ message: "Tongyi API key not configured." });
      }
      aiResponse = await chatWithOpenRouter(message, [], tongyiKey, "qwen/qwen-2.5-72b-instruct");
      
    } else {
      return res.status(400).json({ 
        message: `Unsupported AI model: ${model}.` 
      });
    }

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ 
      message: error.response?.data?.error?.message || error.message || "Failed to get AI response" 
    });
  }
};

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "Text and target language are required" });
    }

    const adminUser = await User.findOne({ email: "admin@gmail.com" }).select("apiKeys");
    const { mistralKey } = adminUser?.apiKeys || {};

    if (!mistralKey) {
      return res.status(400).json({ message: "Mistral API key not configured" });
    }

    const prompt = `Translate the following text to ${targetLanguage}. Only return the translation, nothing else:\n\n${text}`;
    const translation = await chatWithMistral(prompt, [], mistralKey, "mistral-large-latest");

    res.status(200).json({ translation });
  } catch (error) {
    console.error("Error in translateMessage:", error);
    res.status(500).json({ message: "Translation failed" });
  }
};

export const summarizeConversation = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user._id;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "Messages are required" });
    }

    const adminUser = await User.findOne({ email: "admin@gmail.com" }).select("apiKeys");
    const { mistralKey } = adminUser?.apiKeys || {};

    if (!mistralKey) {
      return res.status(400).json({ message: "Mistral API key not configured" });
    }

    const conversationText = messages.map(m => 
      `${m.senderId === userId.toString() ? "You" : "Other"}: ${m.text}`
    ).join("\n");

    const prompt = `Summarize this conversation in 2-3 sentences:\n\n${conversationText}`;
    const summary = await chatWithMistral(prompt, [], mistralKey, "mistral-large-latest");

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error in summarizeConversation:", error);
    res.status(500).json({ message: "Summarization failed" });
  }
};

export const suggestReply = async (req, res) => {
  try {
    const { lastMessage, conversationHistory = [] } = req.body;

    if (!lastMessage) {
      return res.status(400).json({ message: "Last message is required" });
    }

    const adminUser = await User.findOne({ email: "admin@gmail.com" }).select("apiKeys");
    const { mistralKey } = adminUser?.apiKeys || {};

    if (!mistralKey) {
      return res.status(400).json({ message: "Mistral API key not configured" });
    }

    const prompt = `Based on this conversation, suggest 3 brief reply options (each under 15 words):\n\nLast message: "${lastMessage}"`;
    const suggestions = await chatWithMistral(prompt, conversationHistory, mistralKey, "mistral-large-latest");

    const suggestionList = suggestions.split("\n").filter(s => s.trim()).slice(0, 3);

    res.status(200).json({ suggestions: suggestionList });
  } catch (error) {
    console.error("Error in suggestReply:", error);
    res.status(500).json({ message: "Failed to generate suggestions" });
  }
};

// ==================== HELPER FUNCTIONS ====================

// ✅ Mistral - الموقع الرسمي
async function chatWithMistral(message, history, apiKey, model) {
  try {
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    console.log("🚀 Calling Mistral Official API");

    const response = await axios.post(
      MISTRAL_BASE_URL,
      {
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Mistral response received");
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ Mistral API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.error?.message || "Mistral API request failed");
  }
}

// ✅ OpenRouter - لباقي الـ models (Grok, DeepSeek, Tongyi)
async function chatWithOpenRouter(message, history, apiKey, model) {
  try {
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    console.log("🚀 Calling OpenRouter API with model:", model);

    const response = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Nova Chat"
        }
      }
    );

    console.log("✅ OpenRouter response received");
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ OpenRouter API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.error?.message || "OpenRouter API request failed");
  }
}
