import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Bot, Key, Settings, Zap } from "lucide-react";

function AISettingsPage() {
  const [config, setConfig] = useState({
    apiKey: "",
    provider: "openai",
    model: "gpt-3.5-turbo",
    isConfigured: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axiosInstance.get("/ai/config");
      setConfig(prev => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error("Failed to fetch AI config:", error);
    }
  };

  const handleSave = async () => {
    if (!config.apiKey) {
      toast.error("API key is required");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/ai/config", {
        apiKey: config.apiKey,
        provider: config.provider,
        model: config.model,
      });
      toast.success("AI configuration saved successfully!");
      fetchConfig();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <Bot className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Configuration</h1>
              <p className="text-slate-400">Set up your AI assistant</p>
            </div>
          </div>

          {/* Status Badge */}
          {config.isConfigured && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Zap size={16} className="text-green-400" />
              <span className="text-sm font-medium text-green-300">AI is configured and ready</span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* API Provider */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                AI Provider
              </label>
              <select
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="openai">OpenAI (GPT)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Model
              </label>
              <select
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {config.provider === "openai" ? (
                  <>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </>
                ) : (
                  <>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </>
                )}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Key size={16} />
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter your API key"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-2">
                Your API key is stored securely and never shared.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">How to get an API key:</h3>
              <ul className="text-xs text-slate-300 space-y-1">
                {config.provider === "openai" ? (
                  <>
                    <li>1. Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">platform.openai.com</a></li>
                    <li>2. Create an account or sign in</li>
                    <li>3. Go to API Keys section</li>
                    <li>4. Create a new secret key</li>
                  </>
                ) : (
                  <>
                    <li>1. Visit <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">ai.google.dev</a></li>
                    <li>2. Sign in with your Google account</li>
                    <li>3. Generate an API key</li>
                  </>
                )}
              </ul>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISettingsPage;
