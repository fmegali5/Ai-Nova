import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAIStore = create((set, get) => ({
  aiConfig: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    isConfigured: false,
  },
  chatHistory: [],
  isLoading: false,

  fetchConfig: async () => {
    try {
      const res = await axiosInstance.get("/ai/config");
      set({ aiConfig: res.data });
    } catch (error) {
      console.error("Failed to fetch AI config:", error);
    }
  },

  updateConfig: async (config) => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/ai/config", config);
      await get().fetchConfig();
      toast.success("AI configuration updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update config");
    } finally {
      set({ isLoading: false });
    }
  },

  chatWithAI: async (message) => {
    const { chatHistory } = get();
    set({ isLoading: true });

    try {
      const res = await axiosInstance.post("/ai/chat", {
        message,
        conversationHistory: chatHistory,
      });

      const newHistory = [
        ...chatHistory,
        { role: "user", content: message },
        { role: "assistant", content: res.data.response },
      ];

      set({ chatHistory: newHistory, isLoading: false });
      return res.data.response;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "AI request failed");
      throw error;
    }
  },

  translateMessage: async (text, targetLanguage) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/ai/translate", {
        text,
        targetLanguage,
      });
      set({ isLoading: false });
      return res.data.translation;
    } catch (error) {
      set({ isLoading: false });
      toast.error("Translation failed");
      throw error;
    }
  },

  summarizeConversation: async (messages) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/ai/summarize", { messages });
      set({ isLoading: false });
      return res.data.summary;
    } catch (error) {
      set({ isLoading: false });
      toast.error("Summarization failed");
      throw error;
    }
  },

  suggestReply: async (lastMessage, history) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/ai/suggest-reply", {
        lastMessage,
        conversationHistory: history,
      });
      set({ isLoading: false });
      return res.data.suggestions;
    } catch (error) {
      set({ isLoading: false });
      toast.error("Failed to generate suggestions");
      throw error;
    }
  },

  clearChatHistory: () => {
    set({ chatHistory: [] });
  },
}));
