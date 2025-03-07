import React from 'react';
import { Background } from './components/Background';
import { Login } from './components/Login';
import { LoginModal } from './components/auth/LoginModal';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { ChatButton } from './components/chat/ChatButton';
import { ChatModal } from './components/chat/ChatModal';
import { GuestBanner } from './components/GuestBanner';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import { VideoProvider } from './context/VideoContext';
import { UserProvider } from './context/UserContext';
import { DesignProvider } from './context/DesignContext';
import { ViewportProvider } from './context/ViewportContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { SocialBanner } from './components/SocialBanner';
import { User } from './types';
import { useTheme } from './context/ThemeContext';
import { useAnalytics } from './hooks/useAnalytics';
import { trackEvent, ANALYTICS_EVENTS } from './utils/analytics';

function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const { theme } = useTheme();
  
  // Track page views
  useAnalytics();

  const handleLogin = (email: string) => {
    setUser({
      id: crypto.randomUUID(),
      email,
      widgets: [],
    });
    
    trackEvent(ANALYTICS_EVENTS.USER_LOGIN, {
      method: 'email'
    });
  };

  const handleLogout = () => {
    setUser(null);
    
    trackEvent(ANALYTICS_EVENTS.USER_LOGOUT);
  };

  const handleGuestEntry = () => {
    setUser({
      id: crypto.randomUUID(),
      email: 'guest',
      widgets: [],
    });
    
    trackEvent(ANALYTICS_EVENTS.GUEST_ENTRY);
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-white font-body flex flex-col">
      <Background showVideo={!user} />
                        
      {/* Fixed UI Elements */}
      <Header
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleGuestEntry}
      />
                        
      {user && (
        <ChatButton onClick={() => {
          setIsChatOpen(true);
          trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
            action: 'open_chat_button'
          });
        }} />
      )}

      {/* Main Content */}
      {!user ? (
        <Login onGuestEntry={handleGuestEntry} />
      ) : (
        <Dashboard />
      )}
                        
      {/* Modals */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
      <SocialBanner />
    </div>
  );
}

export default App;