import React, { useEffect, useState } from 'react';
import { FiInbox } from 'react-icons/fi';
import { ConversationList } from '../components/inbox';
import { useLocation } from 'react-router-dom';
import ConversationView from '../components/inbox/ConversationView';

const InboxPage = () => {
  const location = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      console.log('InboxPage: Navigation state received:', location.state);
      setSelectedConversationId(null);

      if (location.state.selectedConversationId) {
        console.log('InboxPage: Opening existing conversation:', location.state.selectedConversationId);
        setSelectedConversationId(location.state.selectedConversationId);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBack = () => {
    setSelectedConversationId(null);
  }

  const handleSelectConversation =  (conversationId: string) => {
    console.log('InboxPage: Selected conversation:', conversationId);
    setSelectedConversationId(conversationId);
  }
  
  return (
    <div className="h-full flex flex-col">
      {selectedConversationId ? (
        <ConversationView
          conversationId={selectedConversationId}
          onBack={handleBack}
        />
      ) : (
        <ConversationList onSelectConversation={handleSelectConversation} />
      )}
    </div>
  );
};

export default InboxPage;