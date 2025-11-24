import { User, Settings, Lock, LogOut, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function UserMenu({ onClose, darkMode, onOpenProfile, onOpenSettings, onOpenChangePassword, onOpenAdminPanel }) {
  const { authUser, logout } = useAuthStore();

  // ✅ Check if user is admin
  const isAdmin = authUser?.email === "admin@gmail.com";

  const menuItems = [
    // ✅ Admin Panel (only for admin)
    ...(isAdmin ? [{
      icon: <Shield size={18} />,
      label: "Admin Panel",
      action: () => {
        onClose();
        onOpenAdminPanel();
      },
      special: true
    }] : []),
    { 
      icon: <User size={18} />, 
      label: "Profile", 
      action: () => {
        onClose();
        onOpenProfile();
      }
    },
    { 
      icon: <Settings size={18} />, 
      label: "Settings", 
      action: () => {
        onClose();
        onOpenSettings();
      }
    },
    { 
      icon: <Lock size={18} />, 
      label: "Change Password", 
      action: () => {
        onClose();
        onOpenChangePassword();
      }
    },
    { 
      icon: <LogOut size={18} />, 
      label: "Logout", 
      action: logout, 
      danger: true 
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div 
        className="absolute rounded-xl shadow-2xl z-50 overflow-hidden border"
        style={{
          top: '88px',
          right: '24px',
          width: '288px',
          backgroundColor: darkMode ? '#1a1a1b' : '#ffffff',
          borderColor: darkMode ? '#2d2d2f' : '#eaeaeb'
        }}
      >
        {/* User Info */}
        <div 
          className="p-4 border-b"
          style={{
            borderColor: darkMode ? '#2d2d2f' : '#eaeaeb',
            backgroundColor: darkMode ? 'rgba(45,45,47,0.5)' : '#f8f8f9'
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="User"
              className="rounded-full ring-2"
              style={{
                width: '48px',
                height: '48px',
                ringColor: darkMode ? 'rgba(98,41,255,0.3)' : 'rgba(51,5,130,0.2)'
              }}
            />
            <div className="flex-1 min-w-0">
              <p 
                className="font-semibold truncate"
                style={{ color: darkMode ? '#e0e0e1' : '#1b2127' }}
              >
                {authUser?.fullName || "User"}
              </p>
              <p 
                className="text-sm truncate"
                style={{ color: darkMode ? '#a3a3a8' : '#777c89' }}
              >
                {authUser?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
              style={{
                color: item.danger 
                  ? (darkMode ? '#ff5459' : '#a13d55')
                  : item.special
                  ? (darkMode ? '#6229ff' : '#330582')
                  : (darkMode ? '#e0e0e1' : '#404654'),
                backgroundColor: 'transparent',
                fontWeight: item.special ? '600' : 'normal'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = item.danger
                  ? (darkMode ? 'rgba(255,84,89,0.1)' : 'rgba(161,61,85,0.05)')
                  : item.special
                  ? (darkMode ? 'rgba(98,41,255,0.1)' : 'rgba(51,5,130,0.05)')
                  : (darkMode ? '#2d2d2f' : '#f8f8f9');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default UserMenu;
