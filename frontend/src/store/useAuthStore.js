// store/useAuthStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      
      // ✅ مسح المحادثة الحالية من localStorage
      localStorage.removeItem('ai-nova-current-chat-id');
      
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
      
      // إعادة التوجيه للـ HomePage
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // ✅ حتى لو فشل الـ request، عمل logout محلي
      localStorage.removeItem('ai-nova-current-chat-id');
      set({ authUser: null });
      get().disconnectSocket();
      window.location.href = "/";
    }
  },

  // ✅ UPDATE PROFILE
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      return res.data;
    } catch (error) {
      console.log("Error in update profile:", error);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ SET AUTH USER
  setAuthUser: (user) => {
    set({ authUser: user });
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // ✅ Listen for SESSION_REVOKED event
    socket.on("SESSION_REVOKED", (data) => {
      console.log("🔴 Session revoked:", data);
      
      toast.error(data.message || "You were logged out from another device");
      
      // ✅ Auto logout
      localStorage.removeItem('ai-nova-current-chat-id');
      set({ authUser: null });
      get().disconnectSocket();
      
      // Redirect to home
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    });

    // ✅ Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },
}));
