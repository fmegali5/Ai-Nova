import { useState, useEffect } from "react";
import { X, Key, Save } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

function AdminPanelModal({ onClose, darkMode }) {
  const [loading, setLoading] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [apiKeys, setApiKeys] = useState({
    mistralKey: "",      // ← Mistral (أول واحد)
    grokKey: "",         // ← Grok
    deepseekKey: "",     // ← DeepSeek
    tongyiKey: "",       // ← Tongyi
  });

  // Load existing API keys
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const res = await axiosInstance.get("/admin/api-keys");
        setApiKeys(res.data);
      } catch (error) {
        console.error("Error loading API keys:", error);
      } finally {
        setLoadingKeys(false);
      }
    };
    loadApiKeys();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiKeys.mistralKey && !apiKeys.grokKey && !apiKeys.deepseekKey && !apiKeys.tongyiKey) {
      toast.error("Please enter at least one API key");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put("/admin/api-keys", apiKeys);
      toast.success("API keys updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating API keys:", error);
      toast.error(error.response?.data?.message || "Failed to update API keys");
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
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl shadow-2xl z-50 p-6"
        style={{
          backgroundColor: darkMode ? "#1a1a1b" : "#ffffff",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #330582, #6229ff)",
              }}
            >
              <Key size={20} className="text-white" />
            </div>
            <h2
              className="text-xl font-semibold"
              style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
            >
              Admin Panel
            </h2>
          </div>
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

        {/* Loading State */}
        {loadingKeys ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{
                borderColor: darkMode ? "#6229ff" : "#330582",
              }}
            ></div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mistral API Key - أول واحد */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
              >
                Mistral API Key
              </label>
              <input
                type="password"
                value={apiKeys.mistralKey}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, mistralKey: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all font-mono text-sm"
                style={{
                  backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                  borderColor: darkMode ? "#464649" : "#eaeaeb",
                  color: darkMode ? "#e0e0e1" : "#1b2127",
                }}
                placeholder="VfT..."
                disabled={loading}
              />
            </div>

            {/* Grok API Key */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
              >
                Grok 4.1 Fast API Key
              </label>
              <input
                type="password"
                value={apiKeys.grokKey}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, grokKey: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all font-mono text-sm"
                style={{
                  backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                  borderColor: darkMode ? "#464649" : "#eaeaeb",
                  color: darkMode ? "#e0e0e1" : "#1b2127",
                }}
                placeholder="xai-..."
                disabled={loading}
              />
            </div>

            {/* DeepSeek API Key */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
              >
                DeepSeek API Key
              </label>
              <input
                type="password"
                value={apiKeys.deepseekKey}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, deepseekKey: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all font-mono text-sm"
                style={{
                  backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                  borderColor: darkMode ? "#464649" : "#eaeaeb",
                  color: darkMode ? "#e0e0e1" : "#1b2127",
                }}
                placeholder="sk-..."
                disabled={loading}
              />
            </div>

            {/* Tongyi API Key */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: darkMode ? "#e0e0e1" : "#1b2127" }}
              >
                Tongyi DeepResearch API Key
              </label>
              <input
                type="password"
                value={apiKeys.tongyiKey}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, tongyiKey: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all font-mono text-sm"
                style={{
                  backgroundColor: darkMode ? "#2d2d2f" : "#f8f8f9",
                  borderColor: darkMode ? "#464649" : "#eaeaeb",
                  color: darkMode ? "#e0e0e1" : "#1b2127",
                }}
                placeholder="sk-..."
                disabled={loading}
              />
            </div>

            {/* Info Message */}
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: darkMode ? "rgba(98,41,255,0.1)" : "rgba(51,5,130,0.05)",
                color: darkMode ? "#a3a3a8" : "#777c89",
              }}
            >
              💡 These API keys will be used for AI model requests. Keep them secure.
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
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #330582, #6229ff)",
                }}
                disabled={loading}
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Keys"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default AdminPanelModal;
