import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function VoiceAssistant({ darkMode, selectedModel }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const isProcessingRef = useRef(false);
  const conversationHistoryRef = useRef([]);
  const isActiveRef = useRef(false);

  const isChatSpeechActive = () => {
    const chatSpeechButton = document.querySelector('[data-recording="true"]');
    return !!chatSpeechButton;
  };

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          console.log("Recognition already stopped");
        }
      }
      return;
    }

    if (isChatSpeechActive()) {
      console.log("⚠️ Chat speech is active");
      toast.error("يرجى إيقاف تحويل الكلام إلى نص أولاً");
      setIsActive(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      toast.error("التعرف على الصوت غير متاح. استخدم Chrome أو Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'ar-SA'; // ✅ Arabic recognition
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Listening started...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          
          console.log("🎤 Heard:", transcript);
          
          if (transcript && transcript.length > 0) {
            console.log("✅ Command detected:", transcript);
            handleVoiceCommand(transcript);
          }
        }
      }
    };

    recognition.onspeechstart = () => {
      console.log("🗣️ Speech detected");
    };

    recognition.onspeechend = () => {
      console.log("🤐 Speech ended - waiting for next command...");
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error("Recognition error:", event.error);
      }
      
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast.error("تم رفض الوصول للميكروفون. يرجى السماح بالوصول.");
      }
    };

    recognition.onend = () => {
      console.log("🎤 Recognition ended");
      setIsListening(false);
      
      if (isActiveRef.current && recognitionRef.current) {
        try {
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              recognitionRef.current.start();
              console.log("🎤 Listening restarted...");
            }
          }, 300);
        } catch (error) {
          console.log("Error restarting recognition:", error);
        }
      } else {
        console.log("❌ Not restarting - isActive is false");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      console.log("✅ Voice recognition started");
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      toast.error("فشل تشغيل المايك");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          console.log("Recognition already stopped");
        }
      }
    };
  }, [isActive]);

  const handleVoiceCommand = async (userMessage) => {
    if (isProcessingRef.current) {
      console.log("⚠️ Already processing");
      return;
    }

    isProcessingRef.current = true;
    console.log("📤 Sending:", userMessage);

    try {
      const newHistory = [
        ...conversationHistoryRef.current,
        { role: 'user', content: userMessage }
      ];
      conversationHistoryRef.current = newHistory;

      const res = await axiosInstance.post("/messages/voice", {
        message: userMessage,
        model: selectedModel,
        conversationHistory: newHistory.slice(-10)
      });

      const aiResponse = res.data.message;

      conversationHistoryRef.current = [
        ...newHistory,
        { role: 'assistant', content: aiResponse }
      ];

      console.log("📥 Response:", aiResponse);
      speakText(aiResponse);

    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("خطأ في الاتصال");
      speakText("عذراً، حدث خطأ. حاول مرة تانية.");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) {
      console.error("❌ Speech synthesis not available");
      return;
    }

    console.log("🎤 About to speak:", text);

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // ✅ Try multiple Arabic dialects
    const voices = synthRef.current.getVoices();
    
    console.log("🎙️ Total voices available:", voices.length);
    
    // ✅ Print all Arabic voices for debugging
    const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
    console.log("🇸🇦 Arabic voices found:", arabicVoices.length);
    arabicVoices.forEach((v, i) => {
      console.log(`  ${i + 1}. ${v.name} (${v.lang}) - Local: ${v.localService}`);
    });
    
    // ✅ Priority order: ar-EG > ar-SA > ar-AE > ar > any Arabic
    const egyptianVoice = voices.find(v => v.lang === 'ar-EG');
    const saudiVoice = voices.find(v => v.lang === 'ar-SA');
    const uaeVoice = voices.find(v => v.lang === 'ar-AE');
    const genericArabic = voices.find(v => v.lang === 'ar');
    const anyArabicVoice = voices.find(v => v.lang.startsWith('ar'));
    
    const selectedVoice = egyptianVoice || saudiVoice || uaeVoice || genericArabic || anyArabicVoice;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log("✅ SELECTED:", selectedVoice.name, `(${selectedVoice.lang})`);
    } else {
      utterance.lang = 'ar-SA'; // Fallback
      console.log("⚠️ No Arabic voice found! Using lang: ar-SA");
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log("🎤 Speaking with:", utterance.voice?.name || 'default', `(${utterance.lang})`);
    };

    utterance.onend = () => {
      console.log("✅ Speech ended");
    };

    utterance.onerror = (event) => {
      console.error("❌ Speech error:", event.error);
    };

    try {
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error("❌ Error speaking:", error);
    }
  };

  const toggleVoiceAssistant = () => {
    if (isChatSpeechActive()) {
      toast.error("يرجى إيقاف تحويل الكلام إلى نص أولاً");
      return;
    }

    if (isActive) {
      console.log("🛑 Stopping Voice Assistant...");
      
      setIsActive(false);
      isActiveRef.current = false;
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          console.log("Error aborting recognition:", e);
        }
      }
      
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      
      setIsListening(false);
      toast("تم إيقاف المساعد الصوتي");
      console.log("❌ Voice Assistant Stopped");
    } else {
      console.log("▶️ Starting Voice Assistant...");
      
      setIsActive(true);
      isActiveRef.current = true;
      
      toast.success("🎤 المايك مفتوح - تكلم!");
      console.log("✅ Voice Assistant Started");
      
      speakText("معاك مساعدك الذكي نوفا. ازيك النهاردة؟");
    }
  };

  return (
    <div 
      className="relative inline-block"
      style={{ position: 'relative' }}
    >
      <button
        onClick={toggleVoiceAssistant}
        className="rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
        style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, rgb(51, 5, 130), rgb(98, 41, 255))',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          position: 'relative'
        }}
        title={isActive ? "إيقاف المساعد الصوتي" : "تفعيل المساعد الصوتي"}
      >
        <Sparkles size={16} className="text-white" />
      </button>

      {isActive && (
        <div 
          style={{
            position: 'absolute',
            bottom: '-9.5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            backgroundColor: '#22c55e',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)',
            zIndex: 10
          }}
          className="animate-pulse"
        />
      )}
    </div>
  );
}

export default VoiceAssistant;
