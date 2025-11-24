import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

function SettingsModal({ onClose, darkMode }) {
  const { authUser, setAuthUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format");
      return;
    }

    // Check if nothing changed
    if (formData.fullName === authUser?.fullName && formData.email === authUser?.email) {
      toast.error("No changes detected");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put("/auth/update-settings", formData);
      setAuthUser(res.data);
      toast.success("Settings updated successfully!");
      onClose();
    } catch (error) {
      console.error("Settings update error:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl shadow-2xl z-50 p-6"
        style={{
          backgroundColor: darkMode ? "#1a1a1b" : "#ffffff",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
          >
            Account Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{
              color: darkMode ? "#a3a3a8" : "#777c89",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode
                ? "#2d2d2f"
                : "#f8f8f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                borderColor: darkMode ? "#464649" : "#eaeaeb",
                color: darkMode ? "#e0e0e1" : "#1b2127",
              }}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                borderColor: darkMode ? "#464649" : "#eaeaeb",
                color: darkMode ? "#e0e0e1" : "#1b2127",
              }}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                color: darkMode ? "#e0e0e1" : "#1b2127",
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #330582, #6229ff)",
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SettingsModal;
