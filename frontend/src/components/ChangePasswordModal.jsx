import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

function ChangePasswordModal({ onClose, darkMode }) {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put("/auth/change-password", {
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully!");
      onClose();
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
            Change Password
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
          {/* New Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                  borderColor: darkMode ? "#464649" : "#eaeaeb",
                  color: darkMode ? "#e0e0e1" : "#1b2127",
                }}
                placeholder="Enter new password (min 6 characters)"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: darkMode ? "#a3a3a8" : "#777c89" }}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                  borderColor: darkMode ? "#464649" : "#eaeaeb",
                  color: darkMode ? "#e0e0e1" : "#1b2127",
                }}
                placeholder="Confirm new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: darkMode ? "#a3a3a8" : "#777c89" }}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Requirements Info */}
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: darkMode
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.02)",
              color: darkMode ? "#a3a3a8" : "#777c89",
            }}
          >
            <p className="font-medium mb-1">Password Requirements:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>At least 6 characters long</li>
              <li>Must match in both fields</li>
            </ul>
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
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ChangePasswordModal;
