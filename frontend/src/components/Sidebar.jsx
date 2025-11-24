import { Plus, MessageSquare, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

function Sidebar({ 
  selectedChat, 
  setSelectedChat, 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode,
  chats = [],
  onNewChat,
  onDeleteChat
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sortedChats = [...chats].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  const filteredChats = sortedChats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <>
      {/* ✅ DESKTOP: Thin Icon Sidebar - Always Visible - 73px */}
      {!isMobile && (
        <aside 
          className="border-r flex flex-col items-center py-6 transition-colors flex-shrink-0"
          style={{
            width: '73px',
            backgroundColor: darkMode ? 'hsl(220, 3%, 10%)' : 'hsl(180, 5%, 96%)',
            borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
            zIndex: 20
          }}
        >
          {/* Show Recent Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`relative inline-flex items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg mb-4 group ${sidebarOpen ? 'active' : ''}`}
            style={{
              width: '48px',
              height: '48px',
              borderColor: sidebarOpen 
                ? 'hsl(262, 93%, 26%)'
                : (darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'),
              color: sidebarOpen ? 'hsl(0, 0%, 100%)' : (darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)'),
              backgroundColor: sidebarOpen 
                ? 'hsl(262, 93%, 26%)'
                : 'transparent'
            }}
            title="Show Recent"
          >
            <svg 
              strokeWidth="1.5" 
              className={`w-6 h-6 transition-all ${sidebarOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M11 9l3 3l-3 3"></path>
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0z"></path>
            </svg>
            
            <span 
              className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-10"
              style={{
                backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)',
                color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {sidebarOpen ? 'Hide Recent' : 'Show Recent'}
            </span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="relative inline-flex items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg group"
            style={{
              width: '48px',
              height: '48px',
              borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
              color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)',
              backgroundColor: 'transparent'
            }}
            title="New Chat"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 26%)';
              e.currentTarget.style.borderColor = 'hsl(262, 93%, 26%)';
              e.currentTarget.style.color = 'hsl(0, 0%, 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)';
              e.currentTarget.style.color = darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)';
            }}
          >
            <Plus size={20} />
            
            <span 
              className="absolute left-full ml-2 px-3 py-1.5 text-xs font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none"
              style={{
                backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)',
                color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 9999
              }}
            >
              New Chat
            </span>
          </button>
        </aside>
      )}

      {/* ✅ Chat List Panel - Works for both Desktop & Mobile */}
      <aside 
        className={`border-r flex flex-col transition-all duration-300 flex-shrink-0 ${
          isMobile ? 'fixed inset-y-0 left-0 z-40' : ''
        }`}
        style={{
          width: sidebarOpen ? (isMobile ? '85vw' : '405px') : '0',
          maxWidth: isMobile ? '320px' : '405px',
          backgroundColor: darkMode ? 'hsl(220, 3%, 10%)' : 'hsl(180, 5%, 96%)',
          borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
          zIndex: isMobile ? 40 : 10,
          overflow: sidebarOpen ? 'visible' : 'hidden'
        }}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full">
            {/* Header with Close button for mobile */}
            {isMobile && (
              <div 
                className="flex items-center justify-between p-4 border-b"
                style={{
                  borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'
                }}
              >
                <h2 
                  className="font-semibold text-lg"
                  style={{ color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)' }}
                >
                  Chats
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg transition"
                  style={{
                    color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* ✅ NEW CHAT BUTTON - Mobile Only */}
            {isMobile && (
              <div 
                className="p-4 border-b"
                style={{
                  borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'
                }}
              >
                <button
                  onClick={() => {
                    onNewChat();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: 'hsl(262, 93%, 26%)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 35%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'hsl(262, 93%, 26%)';
                  }}
                >
                  <Plus size={18} />
                  <span>New Chat</span>
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div 
              className="p-4 border-b"
              style={{
                borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'
              }}
            >
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border transition focus:outline-none"
                style={{
                  backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(180, 5%, 96%)',
                  borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
                  color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)'
                }}
              />
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {filteredChats.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare 
                    size={48} 
                    style={{ 
                      color: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)',
                      margin: '0 auto 12px'
                    }} 
                  />
                  <p 
                    className="text-sm"
                    style={{ color: darkMode ? 'hsl(240, 1%, 64%)' : 'hsl(214, 14%, 47%)' }}
                  >
                    {searchQuery ? "No chats found" : "No conversations yet"}
                  </p>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: darkMode ? 'hsl(240, 1%, 49%)' : 'hsl(214, 14%, 67%)' }}
                  >
                    Start a new chat to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => {
                        setSelectedChat(chat);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="w-full p-3 transition text-left group"
                      style={{
                        borderRadius: '16px',
                        backgroundColor: selectedChat?._id === chat._id
                          ? (darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(180, 5%, 96%)')
                          : 'transparent',
                        border: selectedChat?._id === chat._id
                          ? `1px solid ${darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'}`
                          : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedChat?._id !== chat._id) {
                          e.currentTarget.style.backgroundColor = darkMode ? 'hsl(220, 3%, 12%)' : 'hsl(180, 5%, 93%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedChat?._id !== chat._id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p 
                            className="font-medium text-sm truncate"
                            style={{ color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 16%)' }}
                          >
                            {chat.title}
                          </p>
                          <p 
                            className="text-xs mt-0.5"
                            style={{ color: darkMode ? 'hsl(240, 1%, 64%)' : 'hsl(214, 14%, 47%)' }}
                          >
                            {formatDate(chat.updatedAt || chat.createdAt)}
                          </p>
                        </div>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded transition"
                            style={{
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                              color: darkMode ? 'hsl(0, 0%, 88%)' : 'hsl(222, 14%, 29%)'
                            }}
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="5" r="2"/>
                              <circle cx="12" cy="12" r="2"/>
                              <circle cx="12" cy="19" r="2"/>
                            </svg>
                          </button>

                          {openMenuId === chat._id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              
                              <div
                                className="absolute right-0 top-full mt-1 rounded-lg shadow-xl border overflow-hidden z-50"
                                style={{
                                  minWidth: '140px',
                                  backgroundColor: darkMode ? 'hsl(220, 3%, 17%)' : 'hsl(0, 0%, 100%)',
                                  borderColor: darkMode ? 'hsl(220, 3%, 27%)' : 'hsl(180, 3%, 92%)'
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat._id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors"
                                  style={{
                                    color: darkMode ? 'hsl(0, 84%, 60%)' : 'hsl(0, 81%, 42%)',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,84,89,0.15)' : 'rgba(192,21,47,0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <svg 
                                    className="w-4 h-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ✅ Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
