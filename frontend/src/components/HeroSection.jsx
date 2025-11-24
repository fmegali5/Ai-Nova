import { useNavigate } from "react-router";
import { ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";

function HeroSection() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopIndex, setLoopIndex] = useState(0);
  
  const textToType = "Connect & Collaborate\nInstantly";
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText.length < textToType.length) {
          setDisplayText(textToType.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(textToType.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setLoopIndex((prev) => prev + 1);
        }
      }
    };

    const timer = setTimeout(
      handleTyping,
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopIndex]);

  return (
<section className="relative w-full pt-44 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
  {/* pt-44 بدل pt-32 عشان ينزل تحت البار */}
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-left">
            <div className="space-y-4">
              {/* Badge with Zap Animation */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full animate-bounce-slow">
                <Zap size={16} className="text-cyan-400 animate-zap" />
                <span className="text-sm font-medium text-cyan-300">Welcome to Ai Nova</span>
              </div>
              
              {/* Typewriter Heading */}
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight min-h-[140px]">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {displayText.includes('\n') ? (
                    <>
                      {displayText.split('\n')[0]}
                      <br />
                      {displayText.split('\n')[1]}
                      <span className="typewriter-cursor">|</span>
                    </>
                  ) : (
                    <>
                      {displayText || ' '}
                      <span className="typewriter-cursor">|</span>
                    </>
                  )}
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl">
                Experience seamless messaging with real-time synchronization, stunning animations, and powerful features. The modern way to communicate.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 group"
              >
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 border border-slate-600 hover:border-cyan-500 text-slate-200 hover:text-cyan-300 rounded-lg font-semibold transition-all group"
              >
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-cyan-400">10K+</p>
                <p className="text-sm text-slate-400">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-400">99.9%</p>
                <p className="text-sm text-slate-400">Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-400">24/7</p>
                <p className="text-sm text-slate-400">Support</p>
              </div>
            </div>
          </div>

{/* Right Visual - Floating Cards */}
<div className="hidden lg:flex items-center justify-center animate-fade-in-right">
  <div className="relative w-full max-w-md min-h-[420px] flex items-center justify-center">
    {/* Card 1 - New Message (Top Left) */}
    <div className="absolute top-8 left-0 w-[280px] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-float">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">New Message</p>
          <p className="text-xs text-slate-400">Just now</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm">Hey! How are you? Want to chat?</p>
    </div>

    {/* Card 2 - Secure Chat (Bottom Right) */}
    <div className="absolute bottom-8 right-0 w-[280px] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-float-delayed">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Secure Chat</p>
          <p className="text-xs text-slate-400">End-to-end</p>
        </div>
      </div>
      <p className="text-slate-300 text-sm">Your privacy is our priority</p>
    </div>
  </div>
</div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
