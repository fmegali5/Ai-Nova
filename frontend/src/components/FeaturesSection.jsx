import { Bot, Zap, Shield, Brain, Sparkles, Globe } from "lucide-react";

function FeaturesSection() {
  const features = [
    {
      icon: <Bot size={24} />,
      title: "AI-Powered Chat",
      description: "Intelligent conversations with advanced language models for natural interactions.",
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Responses",
      description: "Lightning-fast AI responses powered by cutting-edge neural networks.",
    },
    {
      icon: <Shield size={24} />,
      title: "Privacy First",
      description: "Your conversations are secure with enterprise-grade encryption and data protection.",
    },
    {
      icon: <Brain size={24} />,
      title: "Context Awareness",
      description: "AI remembers conversation context for more meaningful and relevant responses.",
    },
    {
      icon: <Sparkles size={24} />,
      title: "Smart Suggestions",
      description: "Get intelligent recommendations and auto-completions as you type.",
    },
    {
      icon: <Globe size={24} />,
      title: "Multi-language Support",
      description: "Communicate in 100+ languages with real-time AI translation.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-4">
            AI-Powered Features
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Next-generation intelligence for smarter conversations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center mb-4 text-cyan-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
