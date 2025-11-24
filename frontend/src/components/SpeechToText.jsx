import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import toast from "react-hot-toast";

function SpeechToText({ onTranscript, darkMode, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // ✅ Check if Voice Assistant is active
  const isVoiceAssistantActive = () => {
    const voiceAssistantButton = document.querySelector('[title*="Voice Assistant"]');
    if (voiceAssistantButton) {
      const activeIndicator = voiceAssistantButton.parentElement.querySelector('.animate-pulse');
      return !!activeIndicator;
    }
    return false;
  };

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar';
    
    recognition.onstart = () => {
      console.log("🎤 SpeechToText: Started listening");
      setIsListening(true);
      toast.success("🎤 Listening... Speak now!");
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      // ✅ Ignore aborted errors (intentional cleanup)
      if (event.error === 'aborted') {
        console.log("🎤 SpeechToText: Recognition aborted (cleanup)");
        return;
      }
      
      console.error("Speech recognition error:", event.error);
      
      if (event.error === 'no-speech') {
        toast.error("No speech detected. Try again!");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone access denied");
      } else {
        toast.error("Speech recognition error");
      }
      
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🎤 SpeechToText: Stopped listening");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // ✅ CRITICAL: Proper cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort(); // ✅ Use abort() instead of stop()
          console.log("🎤 SpeechToText: Cleanup on unmount");
        } catch (e) {
          console.log("SpeechToText already stopped");
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
      return;
    }

    // ✅ Check if Voice Assistant is active before starting
    if (!isListening && isVoiceAssistantActive()) {
      toast.error("Please stop Voice Assistant (Hey Nova) first");
      return;
    }

    if (isListening) {
      // ✅ Use abort() for proper cleanup
      try {
        recognitionRef.current.abort();
        toast.info("Stopped listening");
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Failed to start listening");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      data-recording={isListening ? "true" : "false"}
      className="flex shrink-0 items-center justify-center rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
      style={{
        width: '40px',
        height: '40px',
        backgroundColor: isListening 
          ? (darkMode ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)")
          : (darkMode ? "hsl(220, 3%, 17%)" : "transparent"),
        color: isListening 
          ? "#ef4444"
          : (darkMode ? "hsl(0, 0%, 88%)" : "hsl(222, 14%, 29%)"),
        border: isListening 
          ? "2px solid #ef4444" 
          : darkMode 
            ? "1px solid hsl(220, 3%, 27%)"
            : "1px solid hsl(180, 3%, 92%)",
      }}
      onMouseEnter={(e) => {
        if (!isListening && !disabled) {
          e.currentTarget.style.backgroundColor = darkMode ? "hsl(220, 3%, 27%)" : "hsl(180, 3%, 92%)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isListening && !disabled) {
          e.currentTarget.style.backgroundColor = darkMode ? "hsl(220, 3%, 17%)" : "transparent";
        }
      }}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <>
          <MicOff className="w-5 h-5" />
          <span className="absolute inset-0 rounded-full animate-ping" style={{
            backgroundColor: "rgba(239, 68, 68, 0.3)"
          }} />
        </>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}

export default SpeechToText;
