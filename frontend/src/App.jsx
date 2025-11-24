import { Navigate, Route, Routes, useLocation } from "react-router";
import ChatLayout from "./components/ChatLayout"; // ✅ الجديد
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import AISettingsPage from "./pages/AISettingsPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import CustomCursor from "./components/CustomCursor";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  // 🔥 Hide decorators on chat page
  const isChatPage = location.pathname === "/chat";

  return (
    <div className={`min-h-screen bg-slate-900 ${!isChatPage ? 'relative flex items-center justify-center p-4 overflow-hidden' : ''}`}>
      {!isChatPage && <CustomCursor />}
      
      {/* DECORATORS - Only show on non-chat pages */}
      {!isChatPage && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
          <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
        </>
      )}

      <Routes>
        <Route path="/" element={authUser ? <Navigate to="/chat" /> : <HomePage />} />
        
        {/* ✅ NEW - AI Chat Layout */}
        <Route path="/chat" element={authUser ? <ChatLayout /> : <Navigate to="/login" />} />
        
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/chat" />} />
        <Route path="/ai-settings" element={authUser ? <AISettingsPage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
