import { useState } from "react";
import { X, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

function ProfileModal({ onClose, darkMode }) {
  const { authUser, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [previewImage, setPreviewImage] = useState(authUser?.profilePic || null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setPreviewImage(base64Image);
      setUploadingImage(true);

      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(error.response?.data?.message || "Failed to upload image");
        setPreviewImage(authUser?.profilePic || null);
      } finally {
        setUploadingImage(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (fullName === authUser?.fullName) {
      toast.error("Please enter a different name");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ fullName });
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
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
            Edit Profile
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
          {/* Profile Picture with Hover Effect */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="relative group">
              <img
                src={previewImage || "/avatar.png"}
                alt="Profile"
                className="rounded-full ring-2 object-cover"
                style={{
                  width: "100px",
                  height: "100px",
                  ringColor: darkMode ? "rgba(98,41,255,0.3)" : "rgba(51,5,130,0.2)",
                }}
              />
              
              {/* Hover Overlay */}
              <label
                htmlFor="profile-image-input"
                className="absolute inset-0 rounded-full flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                }}
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-white text-xs font-medium">Change</span>
                  </>
                )}
              </label>

              {/* Hidden File Input */}
              <input
                type="file"
                id="profile-image-input"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploadingImage || loading}
              />
            </div>

            <p
              className="text-sm"
              style={{ color: darkMode ? "#a3a3a8" : "#777c89" }}
            >
              {authUser?.email}
            </p>
          </div>

          {/* Full Name Input */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                borderColor: darkMode ? "#464649" : "#eaeaeb",
                color: darkMode ? "#e0e0e1" : "#1b2127",
              }}
              placeholder="Enter your full name"
              disabled={loading || uploadingImage}
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
              disabled={loading || uploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #330582, #6229ff)",
              }}
              disabled={loading || uploadingImage}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ProfileModal;
