import React, { useEffect, useState } from 'react';
import { FiInbox } from 'react-icons/fi';
import { ConversationList } from '../components/inbox';
import { useLocation } from 'react-router-dom';
import ConversationView from '../components/inbox/ConversationView';
import NewConversationView from '../components/inbox/NewConversationView';

const InboxPage = () => {
  const location = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newConversation, setNewConversation] = useState<any>(null);

  useEffect(() => {
    if (location.state) {
      console.log('InboxPage: Navigation state received:', location.state);
      setSelectedConversationId(null);
      setNewConversation(null);

      if (location.state.selectedConversationId) {
        console.log('InboxPage: Opening existing conversation:', location.state.selectedConversationId);
        setSelectedConversationId(location.state.selectedConversationId);
      } else if (location.state.newConversation) {
        setNewConversation(location.state.newConversation);
      }

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBack = () => {
    setSelectedConversationId(null);
    setNewConversation(null);
  }

  const handleConversationCreated = (conversationId: string) => {
    console.log('InboxPage: Conversation created, switching to conversation view:', conversationId);
    setNewConversation(null);
    setSelectedConversationId(conversationId);
  };

  const handleSelectConversation =  (conversationId: string) => {
    console.log('InboxPage: Selected conversation:', conversationId);
    setNewConversation(null);
    setSelectedConversationId(conversationId);
  }
  
  return (
    <div className="h-full flex flex-col">
      {selectedConversationId ? (
        <ConversationView
          conversationId={selectedConversationId}
          onBack={handleBack}
        />
      ) : newConversation ? (
        <NewConversationView
          receiverId={newConversation.receiverId}
          receiverName={newConversation.receiverName}
          receiverUsername={newConversation.receiverUsername}
          onBack={handleBack}
          onConversationCreated={handleConversationCreated}
        />
      ) : (
        <ConversationList onSelectConversation={handleSelectConversation} />
      )}
    </div>
  );
};

export default InboxPage;