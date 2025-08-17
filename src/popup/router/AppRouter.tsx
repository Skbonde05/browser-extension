import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FriendsProvider } from '../context/FriendsContext';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import WelcomeScreen from '../components/welcome/WelcomeScreen';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';

// Main Pages
import HomePage from '../pages/HomePage';
import FriendsPage from '../pages/FriendsPage';
import InboxPage from '../pages/InboxPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import MorePage from '../pages/MorePage';

// Settings & Profile Pages
import ProfilePage from '../pages/ProfilePage';

// Future Feature Pages
import NotificationPage from '../pages/NotificationPage';
import AboutPage from '../pages/AboutPage';
import HelpPage from '../pages/HelpPage';
import PrivacyPage from '../pages/PrivacyPage';
import { MessageProvider } from '../context/MessageContext';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] w-[400px] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Auth Routes */}
        {!user && (
          <>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </>
        )}
        
        {/* Main App Routes */}
        {user && (
          <Route path="/*" element={
            <FriendsProvider>
              <MessageProvider>
                <AuthenticatedApp />
              </MessageProvider>
            </FriendsProvider>
          } />
        )}
      </Routes>
    </HashRouter>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  
  const handleRefresh = async () => {
    try {
      if (user?.token) {
        const { flushAnalytics } = await import('../../services/api');
        await flushAnalytics(user.token);
      }
      
      await new Promise<void>((resolve) => {
        chrome.runtime.sendMessage({ type: "PUBLISH_ACTIVE_TAB" }, () => resolve());
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Refresh error:', error);
      window.location.reload();
    }
  };

  const handleNotifications = () => {
    window.location.href = '#/notifications';
  };

  return (
    <AppLayout onRefresh={handleRefresh} onNotifications={handleNotifications}>
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/more" element={<MorePage />} />
        
        {/* other pages */}
        <Route path="/settings" element={<PrivacyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </AppLayout>
  );
};

export default AppRouter;