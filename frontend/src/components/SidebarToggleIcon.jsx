import { MessageSquare } from "lucide-react";

function SidebarToggleIcon({ onClick, darkMode, chatCount = 0 }) {
  return (
    <div 
      className="relative inline-block" 
      style={{ position: 'relative' }}
    >
      <button
        onClick={onClick}
        className="rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
        title="Show Chats"
        style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, rgb(51, 5, 130), rgb(98, 41, 255))',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          position: 'relative'
        }}
      >
        <MessageSquare size={16} className="text-white" />
        
        {/* Badge with chat count */}
        {chatCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 rounded-full text-xs font-bold flex items-center justify-center"
            style={{
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              backgroundColor: '#22c55e',
              color: 'white',
              fontSize: '9px',
              lineHeight: '1'
            }}
          >
            {chatCount > 99 ? '99+' : chatCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default SidebarToggleIcon;
