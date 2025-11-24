import { useState, useRef, useEffect } from "react";
import { Loader } from "lucide-react";
import SpeechToText from "./SpeechToText";

function ChatArea({ 
  selectedChat, 
  darkMode, 
  selectedModel,
  messages,
  setMessages,
  onNewMessage
}) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const examplePrompts = [
    "Transcribe my class notes",
    "Morning Productivity Plan",
    "Cold Email",
    "Newsletter",
    "Summarize",
    "Study Vocabulary",
    "Create a workout plan",
    "Translate This Book",
    "Generate a cute panda image",
    "Plan a 3 day trip to Rome",
    "Pick an outfit",
    "How can I learn coding?",
    "Experience Tokyo",
    "Create a 4 course menu",
    "Help me write a story",
    "Translate"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length > 0) return;

    let animationFrame;
    let translateX = 0;
    let isPaused = false;

    const animate = () => {
      if (!isPaused) {
        translateX -= 0.5;
        const thirdWidth = container.scrollWidth / 3;
        if (Math.abs(translateX) >= thirdWidth) {
          translateX = 0;
        }
        container.style.transform = `translateX(${translateX}px)`;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [messages.length]);

  const handleVoiceTranscript = (transcript) => {
    setInput((prev) => {
      const newText = prev ? `${prev} ${transcript}` : transcript;
      
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }, 0);
      }
      
      return newText;
    });
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            content: event.target.result
          }
        ]);
      };

      if (file.type.startsWith('text/') || 
          file.name.endsWith('.js') || 
          file.name.endsWith('.jsx') || 
          file.name.endsWith('.py') ||
          file.name.endsWith('.java') ||
          file.name.endsWith('.cpp') ||
          file.name.endsWith('.html') ||
          file.name.endsWith('.css') ||
          file.name.endsWith('.json') ||
          file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (messageText) => {
    if ((!messageText.trim() && uploadedFiles.length === 0) || isLoading) return;

    let fullMessage = messageText;
    
    if (uploadedFiles.length > 0) {
      const filesText = uploadedFiles
        .map(file => `[File: ${file.name}]\n\`\`\`\n${file.content}\n\`\`\``)
        .join('\n\n');
      fullMessage = `${messageText}\n\n${filesText}`;
    }

    const userMessage = { 
      role: "user", 
      content: messageText,
      files: uploadedFiles.length > 0 ? uploadedFiles.map(f => ({
        name: f.name,
        type: f.type
      })) : null
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          message: fullMessage,
          model: selectedModel
        }),
      });

      const data = await response.json();
      const aiResponse = data.response || "Sorry, I couldn't process that.";
      const aiMessage = { role: "assistant", content: aiResponse };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      if (onNewMessage) {
        onNewMessage(messageText, aiResponse);
      }
      
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = { role: "assistant", content: "Sorry, I encountered an error." };
      setMessages((prev) => [...prev, errorMessage]);
      
      if (onNewMessage) {
        onNewMessage(messageText, "Sorry, I encountered an error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // SVG Icons
  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  );

  const SendIcon = () => (
    <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.25 12V7.5L6.25 6L0.25 4.5V0L14.5 6L0.25 12Z" />
    </svg>
  );

  const CircleIcon = () => (
    <svg 
      className="w-[23px] h-[23px]" 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
  
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );

  return (
    <div 
      className="flex-1 flex flex-col transition-colors duration-200 relative"
      style={{
        backgroundColor: darkMode ? 'hsl(220, 3%, 10%)' : 'hsl(180, 5%, 96%)'
      }}
    >
      {/* Messages Area */}
      <div className="relative flex grow flex-col">
        <div className="grid place-items-center w-full overflow-x-hidden h-full">
          
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="pointer-events-auto visible col-start-1 col-end-1 row-start-1 row-end-1 flex w-full scale-100 flex-col items-center overflow-hidden py-10 opacity-100 transition-all">
              <div style={{ maxWidth: '590px', width: '100%', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <h2 
                  className="mb-8 text-center text-3xl font-bold leading-[1.2em] md:text-[34px]"
                  style={{
                    fontSize: 'clamp(34px, 2vw, 40px)',
                    color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)'
                  }}
                >
                  <span 
                    className="block"
                    style={{
                      fontSize: '0.647em',
                      opacity: 0.5,
                      color: darkMode ? 'hsl(240, 1%, 49%)' : 'hsl(214, 14%, 67%)'
                    }}
                  >
                    I'm Default AI Chat Bot
                  </span>
                  Ask me anything
                </h2>
              </div>

              {/* Prompts Marquee */}
              <div 
                className="w-full overflow-hidden"
                style={{
                  height: '58px',
                  position: 'relative',
                  maskImage: 'linear-gradient(to right, transparent, black 7rem, black calc(100% - 7rem), transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 7rem, black calc(100% - 7rem), transparent)'
                }}
              >
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 py-2"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: 'max-content',
                    userSelect: 'none',
                    transform: 'translateX(0)',
                    willChange: 'transform'
                  }}
                >
                  {[...examplePrompts, ...examplePrompts, ...examplePrompts].map((prompt, index) => (
                    <button
                      key={index}
                      className="lqd-marquee-cell inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-2.5 py-3 text-base font-semibold leading-[1.15em] transition-all hover:-translate-y-1 hover:shadow"
                      style={{
                        fontSize: 'clamp(14px, 1.2vw, 16px)',
                        backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)',
                        border: darkMode 
                          ? '1px solid hsl(220, 3%, 27%)'
                          : '1px solid hsl(180, 3%, 92%)',
                        boxShadow: darkMode 
                          ? 'none' 
                          : '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
                      }}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                    >
                      <span 
                        className="bg-clip-text text-transparent"
                        style={{
                          backgroundImage: 'linear-gradient(to right, #3D9BFC, #5F53EB, #70B4AF)'
                        }}
                      >
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          {messages.length > 0 && (
            <div className="chat-messages-container chats-container text-xs p-8 max-md:p-4 overflow-x-hidden col-start-1 col-end-1 row-start-1 row-end-1 w-full transition-all h-full">
              <div className="w-full max-w-4xl mx-auto">
                <div className="space-y-6">
                  {messages.map((msg, idx) => {
                    const isArabic = /[\u0600-\u06FF]/.test(msg.content);
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-4 animate-fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div 
                          className="rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            width: '44px',
                            height: '44px',
                            backgroundColor: msg.role === "user" 
                              ? 'hsl(262, 93%, 26%)' 
                              : (darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)'),
                            border: msg.role === "user" 
                              ? 'none' 
                              : darkMode 
                                ? '1px solid hsl(220, 3%, 27%)'
                                : '1px solid hsl(180, 3%, 92%)'
                          }}
                        >
                          {msg.role === "user" ? (
                            <div style={{ color: 'hsl(0, 0%, 100%)' }}>
                              <UserIcon />
                            </div>
                          ) : (
                            <div style={{ color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)' }}>
                              <CircleIcon />
                            </div>
                          )}
                        </div>

                        <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                          {msg.files && msg.files.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {msg.files.map((file, fileIdx) => (
                                <div 
                                  key={fileIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: darkMode ? 'rgba(98,41,255,0.15)' : 'rgba(51,5,130,0.08)',
                                    color: 'hsl(262, 93%, 26%)'
                                  }}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  <span>{file.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div
                            className="chat-content-container group relative inline-block px-6 py-3.5"
                            style={{
                              maxWidth: 'calc(100% - 64px)',
                              borderRadius: '2em',
                              backgroundColor: msg.role === "user" 
                                ? 'hsl(262, 93%, 26%)' 
                                : (darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)'),
                              color: msg.role === "user" 
                                ? 'hsl(0, 0%, 100%)' 
                                : (darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)'),
                              border: msg.role === "user" 
                                ? 'none' 
                                : darkMode 
                                  ? '1px solid hsl(220, 3%, 27%)'
                                  : '1px solid hsl(180, 3%, 92%)',
                              direction: isArabic ? 'rtl' : 'ltr',
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            <pre className="chat-content prose relative w-full max-w-none !whitespace-pre-wrap indent-0 font-[inherit] text-xs font-normal text-current [word-break:break-word] m-0">
                              {msg.content}
                            </pre>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="lqd-chat-ai-bubble mb-2.5 flex max-w-full content-start items-start gap-4 animate-fade-in">
                      <div 
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)',
                          border: darkMode 
                            ? '1px solid hsl(220, 3%, 27%)'
                            : '1px solid hsl(180, 3%, 92%)'
                        }}
                      >
                        <div style={{ color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)' }}>
                          <CircleIcon />
                        </div>
                      </div>
                      <div 
                        className="chat-content-container group relative px-6 py-3.5 flex items-center gap-2"
                        style={{
                          maxWidth: 'calc(100% - 64px)',
                          borderRadius: '2em',
                          backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)',
                          border: darkMode 
                            ? '1px solid hsl(220, 3%, 27%)'
                            : '1px solid hsl(180, 3%, 92%)'
                        }}
                      >
                        <Loader className="w-4 h-4 animate-spin" style={{ color: 'hsl(151, 79.70%, 38.60%)' }} />
                        <span 
                          className="text-xs"
                          style={{ color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)' }}
                        >
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area + Footer */}
      <div 
        className="lqd-chat-form-wrap sticky bottom-0 z-[9] transition-colors flex-shrink-0"
        style={{
          backgroundColor: darkMode ? 'hsl(220, 3%, 10%)' : 'hsl(180, 5%, 96%)'
        }}
      >
        <div 
          className="hidden md:block pointer-events-none absolute inset-x-0 z-0 transition-colors"
          style={{
            top: '-3.5rem',
            bottom: 0,
            backgroundColor: darkMode ? 'hsl(220, 3%, 10%)' : 'hsl(180, 5%, 96%)',
            maskImage: 'linear-gradient(to bottom, transparent, black 30%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%)'
          }}
        />

        <form 
          onSubmit={handleSubmit}
          className="lqd-chat-form flex w-full flex-wrap items-end gap-3 self-end px-8 py-5 max-md:items-end max-md:p-4 max-sm:p-3 md:relative md:z-[1] md:px-5 lg:mx-auto lg:w-full lg:max-w-[820px] lg:p-0 lg:pb-8"
        >
          <div
            className="lqd-chat-form-inputs-container flex w-full flex-col transition-colors"
            style={{
              minHeight: '52px',
              borderRadius: '26px',
              border: '1px solid',
              borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
              backgroundColor: darkMode ? 'hsl(220, 3%, 10%)' : 'hsl(180, 5%, 96%)',
              ...(typeof window !== 'undefined' && window.innerWidth >= 1024 && {
                borderRadius: '35px',
                border: 'none',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'hsl(0, 0%, 100%)',
                boxShadow: '0 4px 60px rgba(0,0,0,0.035)'
              })
            }}
          >
            {/* Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="px-3 py-2 mx-2 mt-2 space-y-2 max-h-32 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      backgroundColor: darkMode ? 'rgba(98,41,255,0.1)' : 'rgba(51,5,130,0.05)',
                      borderLeft: `3px solid hsl(262, 93%, 26%)`
                    }}
                  >
                    <svg 
                      className="w-4 h-4 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: 'hsl(262, 93%, 26%)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-xs font-medium truncate"
                        style={{ color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)' }}
                      >
                        {file.name}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: darkMode ? 'hsl(240, 1%, 64%)' : 'hsl(214, 14%, 47%)' }}
                      >
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 rounded hover:bg-opacity-80 transition flex-shrink-0"
                      style={{
                        backgroundColor: darkMode ? 'rgba(255,84,89,0.2)' : 'rgba(192,21,47,0.15)',
                        color: darkMode ? 'hsl(0, 84%, 60%)' : 'hsl(0, 81%, 42%)'
                      }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input Row */}
            <div className="relative flex grow items-center">
              
              {/* Upload Button (Mobile Left) */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 border transition-all md:hidden flex items-center justify-center rounded-full ml-2 relative"
                style={{
                  width: '40px',
                  height: '40px',
                  borderColor: uploadedFiles.length > 0 
                    ? 'hsl(262, 93%, 26%)' 
                    : (darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'),
                  color: uploadedFiles.length > 0
                    ? 'hsl(262, 93%, 26%)'
                    : (darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)'),
                  backgroundColor: uploadedFiles.length > 0
                    ? (darkMode ? 'rgba(98,41,255,0.1)' : 'rgba(51,5,130,0.05)')
                    : 'transparent'
                }}
              >
                {uploadedFiles.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 flex items-center justify-center rounded-full w-5 h-5 text-xs font-bold"
                    style={{
                      backgroundColor: 'hsl(262, 93%, 26%)',
                      color: 'hsl(0, 0%, 100%)'
                    }}
                  >
                    {uploadedFiles.length}
                  </span>
                )}
                <PlusIcon />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type a message"
                rows={1}
                disabled={isLoading}
                className="lqd-input block peer px-4 border-none bg-transparent m-0 max-h-32 w-full py-2 text-sm resize-none focus:outline-none focus:ring-0 transition-colors ps-14 pe-[240px] max-lg:pe-[200px] max-md:max-h-[200px] max-md:pe-2 max-md:ps-1 max-md:text-[16px] lg:min-h-[70px] lg:py-6 lg:ps-20"
                style={{
                  color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)'
                }}
              />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="*/*"
                multiple
              />

              {/* Desktop Actions */}
              <div className="hidden md:flex absolute bottom-2 right-5 items-center gap-1.5 lg:gap-2.5">
                
                {/* Upload */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex shrink-0 items-center justify-center rounded-full border transition-all hover:shadow-md relative"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderColor: uploadedFiles.length > 0 
                      ? 'hsl(262, 93%, 26%)' 
                      : (darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'),
                    color: uploadedFiles.length > 0
                      ? 'hsl(262, 93%, 26%)'
                      : (darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)'),
                    backgroundColor: uploadedFiles.length > 0
                      ? (darkMode ? 'rgba(98,41,255,0.1)' : 'rgba(51,5,130,0.05)')
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (uploadedFiles.length === 0) {
                      e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 26%)';
                      e.currentTarget.style.borderColor = 'hsl(262, 93%, 26%)';
                      e.currentTarget.style.color = 'hsl(0, 0%, 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (uploadedFiles.length === 0) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)';
                      e.currentTarget.style.color = darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)';
                    }
                  }}
                >
                  {uploadedFiles.length > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 flex items-center justify-center rounded-full w-5 h-5 text-xs font-bold"
                      style={{
                        backgroundColor: 'hsl(262, 93%, 26%)',
                        color: 'hsl(0, 0%, 100%)'
                      }}
                    >
                      {uploadedFiles.length}
                    </span>
                  )}
                  <PlusIcon />
                </button>

                {/* Speech-to-Text */}
                <SpeechToText
                  onTranscript={handleVoiceTranscript}
                  darkMode={darkMode}
                  disabled={isLoading}
                />
                
                {/* Send */}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: isLoading || !input.trim()
                      ? darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'
                      : 'hsl(262, 93%, 26%)',
                    color: isLoading || !input.trim()
                      ? darkMode ? 'hsl(240, 1%, 49%)' : 'hsl(214, 14%, 67%)'
                      : 'hsl(0, 0%, 100%)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && input.trim()) {
                      e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 30%)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && input.trim()) {
                      e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 26%)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <SendIcon />
                </button>
              </div>

              {/* Mobile Actions - Right Side */}
              <div className="md:hidden flex items-center gap-1 mr-2">
                
                {/* Speech-to-Text - Mobile */}
                <SpeechToText
                  onTranscript={handleVoiceTranscript}
                  darkMode={darkMode}
                  disabled={isLoading}
                />
                
                {/* Send - Mobile */}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: isLoading || !input.trim()
                      ? darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'
                      : 'hsl(262, 93%, 26%)',
                    color: isLoading || !input.trim()
                      ? darkMode ? 'hsl(240, 1%, 49%)' : 'hsl(214, 14%, 67%)'
                      : 'hsl(0, 0%, 100%)'
                  }}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatArea;
