import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router/AppRouter';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['hasSeenOnboarding'], (res) => {
      setShowOnboarding(!res?.hasSeenOnboarding);
    });
  }, []);

  // Avoid flicker while loading storage
  if (showOnboarding === null) return null;

  return (
    <AuthProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#4ade80',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />

      {showOnboarding ? (
        <Onboarding
          onFinish={() => {
            chrome.storage.local.set({ hasSeenOnboarding: true });
            setShowOnboarding(false);
          }}
        />
      ) : (
        <AppRouter />
      )}
    </AuthProvider>
  );
};

export default App;
