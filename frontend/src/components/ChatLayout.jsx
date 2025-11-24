import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  MoreHorizontal, 
  Moon,
  Sun,
  Sparkles,
  Zap,
  Brain,
  FileDown,
  Camera
  // ❌ Removed: MessageSquare
} from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // ✅ Add
import { faBars } from '@fortawesome/free-solid-svg-icons'; // ✅ Add
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import UserMenu from "./UserMenu";
import ProfileModal from "./ProfileModal";
import SettingsModal from "./SettingsModal";
import ChangePasswordModal from "./ChangePasswordModal";
import AdminPanelModal from "./AdminPanelModal";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import VoiceAssistant from "./VoiceAssistant";


function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAdminPanelModal, setShowAdminPanelModal] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Mistral");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { authUser } = useAuthStore();

  const userIsPremium = authUser?.isPremium || false;

  // ✅ Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Load chats من MongoDB
  useEffect(() => {
    const loadChats = async () => {
      if (!authUser) return;
      
      try {
        const res = await axiosInstance.get("/chat");
        setChats(res.data);
      } catch (error) {
        console.error("Error loading chats:", error);
        toast.error("Failed to load chats");
      }
    };

    loadChats();
  }, [authUser]);

  // ✅ مسح المحادثة لما المستخدم يسجل خروج
  useEffect(() => {
    if (!authUser) {
      setSelectedChat(null);
      setMessages([]);
      setChats([]);
    }
  }, [authUser]);

  // ✅ Function عشان تعمل chat جديدة من أول رسالة
  const handleNewMessage = async (userMessage, aiResponse) => {
    if (!selectedChat || messages.length === 0) {
      const chatTitle = userMessage.length > 50 
        ? userMessage.substring(0, 50) + '...' 
        : userMessage;

      try {
        const res = await axiosInstance.post("/chat", {
          title: chatTitle,
          messages: [
            { role: "user", content: userMessage },
            { role: "assistant", content: aiResponse }
          ],
          model: selectedModel
        });

        const newChat = res.data;
        setChats([newChat, ...chats]);
        setSelectedChat(newChat);
        setMessages(newChat.messages);
      } catch (error) {
        console.error("Error creating chat:", error);
        toast.error("Failed to save chat");
      }
    } else {
      const newMessages = [
        ...messages,
        { role: "user", content: userMessage },
        { role: "assistant", content: aiResponse }
      ];
      
      setMessages(newMessages);

      try {
        await axiosInstance.put(`/chat/${selectedChat._id}`, {
          messages: newMessages
        });

        const updatedChats = chats.map(chat => 
          chat._id === selectedChat._id 
            ? { ...chat, messages: newMessages, updatedAt: new Date() }
            : chat
        );
        setChats(updatedChats);
      } catch (error) {
        console.error("Error updating chat:", error);
        toast.error("Failed to save message");
      }
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
  };

  const handleNewChat = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axiosInstance.delete(`/chat/${chatId}`);
      
      const updatedChats = chats.filter(chat => chat._id !== chatId);
      setChats(updatedChats);
      
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }

      toast.success("Chat deleted");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // ✅ AI Models
  const aiModels = [
    { name: "Mistral", icon: <Sparkles size={14} />, color: "#ff7000" },
    { name: "Grok 4.1 Fast", icon: <Zap size={14} />, color: "#000000" },
    { name: "DeepSeek", icon: <Brain size={14} />, color: "#0066ff" },
    { name: "Tongyi DeepResearch", icon: <Sparkles size={14} />, color: "#ff6600" },
  ];
  
  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    setShowModelMenu(false);
  };

  const currentModel = aiModels.find(m => m.name === selectedModel);

  const forceStandardColors = (element) => {
    const originalStyles = new Map();
    const elements = element.querySelectorAll('*');
    const allElements = [element, ...Array.from(elements)];
    
    allElements.forEach(el => {
      try {
        const computedStyle = window.getComputedStyle(el);
        
        originalStyles.set(el, {
          backgroundColor: el.style.backgroundColor,
          color: el.style.color,
          borderColor: el.style.borderColor,
        });
        
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        const borderColor = computedStyle.borderColor;
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          el.style.setProperty('background-color', bgColor, 'important');
        }
        if (textColor) {
          el.style.setProperty('color', textColor, 'important');
        }
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
          el.style.setProperty('border-color', borderColor, 'important');
        }
      } catch (e) {
        // Ignore
      }
    });
    
    return originalStyles;
  };

  const restoreOriginalColors = (originalStyles) => {
    originalStyles.forEach((styles, el) => {
      try {
        el.style.backgroundColor = styles.backgroundColor;
        el.style.color = styles.color;
        el.style.borderColor = styles.borderColor;
      } catch (e) {
        // Ignore
      }
    });
  };

  const handleExportPDF = async () => {
    setShowMoreMenu(false);
    
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const toastId = toast.loading("Generating PDF...");

    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const chatArea = document.querySelector('.chat-messages-container');
      if (!chatArea) {
        toast.error("Chat area not found", { id: toastId });
        return;
      }

      const originalStyles = forceStandardColors(chatArea);
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(chatArea, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: darkMode ? '#1a1a1b' : '#f4f5f5',
        onclone: (clonedDoc) => {
          const clonedArea = clonedDoc.querySelector('.chat-messages-container');
          if (clonedArea) {
            forceStandardColors(clonedArea);
          }
        }
      });

      restoreOriginalColors(originalStyles);

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`chat-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("PDF exported successfully!", { id: toastId });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF", { id: toastId });
    }
  };

  const handleTakeScreenshot = async () => {
    setShowMoreMenu(false);
    
    if (messages.length === 0) {
      toast.error("No messages to capture");
      return;
    }

    const toastId = toast.loading("Taking screenshot...");

    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const chatArea = document.querySelector('.chat-messages-container');
      if (!chatArea) {
        toast.error("Chat area not found", { id: toastId });
        return;
      }

      const originalStyles = forceStandardColors(chatArea);
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(chatArea, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: darkMode ? '#1a1a1b' : '#f4f5f5',
        onclone: (clonedDoc) => {
          const clonedArea = clonedDoc.querySelector('.chat-messages-container');
          if (clonedArea) {
            forceStandardColors(clonedArea);
          }
        }
      });

      restoreOriginalColors(originalStyles);

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to create image", { id: toastId });
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screenshot-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Screenshot saved!", { id: toastId });
      }, 'image/png');
    } catch (error) {
      console.error("Error taking screenshot:", error);
      toast.error("Failed to take screenshot", { id: toastId });
    }
  };

  return (
    <div 
      className="flex min-h-screen transition-colors"
      style={{
        backgroundColor: darkMode ? '#1a1a1b' : '#f4f5f5'
      }}
    >
      {/* Sidebar with Chat List */}
      <Sidebar 
        selectedChat={selectedChat}
        setSelectedChat={handleChatSelect}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        chats={chats}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ Top Header - Responsive */}
        <div 
          className="px-4 md:px-6 flex items-center justify-between border-b transition-colors flex-shrink-0"
          style={{
            height: '60px',
            minHeight: '60px',
            maxHeight: '60px',
            borderColor: darkMode ? '#2d2d2f' : '#eaeaeb',
            backgroundColor: darkMode ? '#1a1a1b' : 'hsl(180, 5%, 96%)'
          }}
        >
          {/* Left Section */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            {/* Avatar + Bot Name */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
{/* ✅ Sidebar Toggle Icon - Mobile Only - Custom Sidebar Icon */}
{isMobile && (
  <button
    onClick={() => setSidebarOpen(true)}
    className="flex items-center justify-center flex-shrink-0 transition-all hover:opacity-70"
    title="Show Chats"
    style={{
      width: '32px',
      height: '32px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      position: 'relative',
      marginLeft: '-11px'
      
    }}
  >
    {/* ✅ Custom Sidebar SVG Icon */}
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: darkMode ? '#e0e0e1' : '#1b2127' }}
    >
      {/* Outer rectangle */}
      <rect 
        x="3" 
        y="3" 
        width="18" 
        height="18" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      {/* Vertical divider line */}
      <line 
        x1="9" 
        y1="3" 
        x2="9" 
        y2="21" 
        stroke="currentColor" 
        strokeWidth="2"
      />
    </svg>
 
  </button>
)}


              {/* ✅ Voice Assistant */}
              <VoiceAssistant 
                darkMode={darkMode}
                selectedModel={selectedModel}
              />
              
              <span 
                className="font-semibold text-sm md:text-base truncate hidden sm:block"
                style={{ color: darkMode ? '#e0e0e1' : '#1b2127' }}
              >
                Default AI Chat Bot
              </span>
            </div>

            {/* AI Model Selector - Hidden on Mobile */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition hover:shadow-md"
                style={{
                  backgroundColor: darkMode ? '#2d2d2f' : '#f8f8f9',
                  color: darkMode ? '#e0e0e1' : '#404654',
                  border: `1px solid ${darkMode ? '#464649' : '#eaeaeb'}`
                }}
              >
                {currentModel?.icon}
                <span>{selectedModel}</span>
                <ChevronDown size={14} />
              </button>

              {/* Model Dropdown Menu */}
              {showModelMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowModelMenu(false)}
                  />
                  
                  <div
                    className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl border z-40 overflow-hidden"
                    style={{
                      backgroundColor: darkMode ? '#1a1a1b' : '#ffffff',
                      borderColor: darkMode ? '#2d2d2f' : '#eaeaeb'
                    }}
                  >
                    {aiModels.map((model, index) => (
                      <button
                        key={index}
                        onClick={() => handleModelSelect(model.name)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: selectedModel === model.name 
                            ? (darkMode ? 'rgba(98,41,255,0.1)' : 'rgba(51,5,130,0.05)')
                            : 'transparent',
                          color: darkMode ? '#e0e0e1' : '#404654',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedModel !== model.name) {
                            e.currentTarget.style.backgroundColor = darkMode ? '#2d2d2f' : '#f8f8f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedModel !== model.name) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{ color: model.color }}>
                          {model.icon}
                        </div>
                        <span className="flex-1 text-left">{model.name}</span>
                        {selectedModel === model.name && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* More Options with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 rounded-lg transition flex items-center justify-center"
                style={{
                  width: '36px',
                  height: '36px',
                  color: darkMode ? '#a3a3a8' : '#777c89',
                  backgroundColor: showMoreMenu 
                    ? (darkMode ? '#2d2d2f' : '#f8f8f9')
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!showMoreMenu) {
                    e.currentTarget.style.backgroundColor = darkMode ? '#2d2d2f' : '#f8f8f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showMoreMenu) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <MoreHorizontal size={18} />
              </button>

              {/* More Options Dropdown */}
              {showMoreMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowMoreMenu(false)}
                  />
                  
                  <div
                    className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl border z-40 overflow-hidden"
                    style={{
                      backgroundColor: darkMode ? '#1a1a1b' : '#ffffff',
                      borderColor: darkMode ? '#2d2d2f' : '#eaeaeb'
                    }}
                  >
                    {/* Change Model - Mobile Only */}
                    <div className="md:hidden">
                      {!showModelMenu ? (
                        <button
                          onClick={() => setShowModelMenu(true)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                          style={{
                            color: darkMode ? '#e0e0e1' : '#404654',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkMode ? '#2d2d2f' : '#f8f8f9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Sparkles size={16} />
                          <span>Change Model</span>
                          <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                        </button>
                      ) : (
                        <>
                          <div 
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                            style={{
                              color: darkMode ? '#a3a3a8' : '#777c89',
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                              borderBottom: `1px solid ${darkMode ? '#2d2d2f' : '#eaeaeb'}`
                            }}
                          >
                            <span>Select AI Model</span>
                            <button
                              onClick={() => setShowModelMenu(false)}
                              className="ml-auto text-sm"
                              style={{
                                color: darkMode ? '#a3a3a8' : '#777c89',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0 4px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          
                          {aiModels.map((model, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleModelSelect(model.name);
                                setShowMoreMenu(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                              style={{
                                backgroundColor: selectedModel === model.name 
                                  ? (darkMode ? 'rgba(98,41,255,0.1)' : 'rgba(51,5,130,0.05)')
                                  : 'transparent',
                                color: darkMode ? '#e0e0e1' : '#404654',
                              }}
                              onMouseEnter={(e) => {
                                if (selectedModel !== model.name) {
                                  e.currentTarget.style.backgroundColor = darkMode ? '#2d2d2f' : '#f8f8f9';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (selectedModel !== model.name) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <div style={{ color: model.color }}>
                                {model.icon}
                              </div>
                              <span className="flex-1 text-left">{model.name}</span>
                              {selectedModel === model.name && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleExportPDF}
                      disabled={messages.length === 0}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        color: messages.length === 0 
                          ? (darkMode ? 'hsl(240, 1%, 49%)' : 'hsl(214, 14%, 67%)')
                          : (darkMode ? '#e0e0e1' : '#404654'),
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (messages.length > 0) {
                          e.currentTarget.style.backgroundColor = darkMode ? '#2d2d2f' : '#f8f8f9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <FileDown size={16} />
                      <span>Export as PDF</span>
                    </button>

                    <button
                      onClick={handleTakeScreenshot}
                      disabled={messages.length === 0}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        color: messages.length === 0 
                          ? (darkMode ? 'hsl(240, 1%, 49%)' : 'hsl(214, 14%, 67%)')
                          : (darkMode ? '#e0e0e1' : '#404654'),
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (messages.length > 0) {
                          e.currentTarget.style.backgroundColor = darkMode ? '#2d2d2f' : '#f8f8f9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Camera size={16} />
                      <span>Take Screenshot</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Logo (Always Visible) */}
          <div 
            className="flex items-center gap-2.5 absolute left-1/2 transform -translate-x-1/2"
          >
            <img 
              src="/vite.svg"
              className="rounded-full"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'cover'
              }}
              alt="Logo"
            />
            <span 
              className="font-bold text-lg"
              style={{ color: darkMode ? '#e0e0e1' : '#1b2127' }}
            >
              Ai Nova
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="lqd-light-dark-switch flex items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{
                width: '36px',
                height: '36px',
                borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
                color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)',
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 26%)';
                e.currentTarget.style.borderColor = 'hsl(262, 93%, 26%)';
                e.currentTarget.style.color = 'hsl(0, 0%, 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255, 255, 255, 0.03)' : 'transparent';
                e.currentTarget.style.borderColor = darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)';
                e.currentTarget.style.color = darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative rounded-full overflow-hidden ring-2 transition-all"
              style={{
                width: '36px',
                height: '36px',
                ringColor: darkMode ? '#464649' : '#eaeaeb'
              }}
            >
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="User"
                className="w-full h-full object-cover"
              />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <UserMenu 
                onClose={() => setShowUserMenu(false)} 
                darkMode={darkMode}
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenSettings={() => setShowSettingsModal(true)}
                onOpenChangePassword={() => setShowChangePasswordModal(true)}
                onOpenAdminPanel={() => setShowAdminPanelModal(true)}
              />
            )}
          </div>
        </div>

        {/* Chat Area */}
        <ChatArea 
          selectedChat={selectedChat} 
          userIsPremium={userIsPremium}
          darkMode={darkMode}
          selectedModel={selectedModel}
          messages={messages}
          setMessages={setMessages}
          onNewMessage={handleNewMessage}
        />
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          darkMode={darkMode}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          darkMode={darkMode}
        />
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          darkMode={darkMode}
        />
      )}

      {showAdminPanelModal && (
        <AdminPanelModal
          onClose={() => setShowAdminPanelModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default ChatLayout;
