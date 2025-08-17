import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessage } from '../../context/MessageContext';
import { FiArrowLeft, FiMoreVertical, FiUser } from 'react-icons/fi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

const ConversationView = ({ conversationId, onBack }: ConversationViewProps) => {
  const { user } = useAuth();
  const {
    conversations,
    loadMessages,
    messages,
    sendMessage
  } = useMessage();
  const [loading, setLoading] = useState(true);
  
  const conversation = conversations.find(c => c.conversation.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  console.log(conversation)
  const isPending = conversation?.status === 'PENDING';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadMessages(conversationId);
      setLoading(false);
    };
    loadData();
  }, [conversationId, loadMessages]);

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Conversation not found</p>
          <button
            onClick={onBack}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { conversation: conv } = conversation;

  const getDisplayInfo = () => {
    if (conv.type === 'GROUP') {
      return {
        name: conv.name || 'Group Chat',
        subtitle: `${conv.participants.length} members`,
        icon: <FiUser size={20} className="text-blue-600" />
      };
    } else {
      const otherParticipant = conv.participants.find(p => p.user.id !== user?.id);
      return {
        name: otherParticipant?.user.displayName || otherParticipant?.user.username || 'Unknown',
        subtitle: `@${otherParticipant?.user.username || 'unknown'}`,
        icon: <FiUser size={20} className="text-green-600" />
      };
    }
  };

  const handleSendMessage  = async (content: string) => {
    await sendMessage({ conversationId, content });
  }

  const { name, subtitle, icon } = getDisplayInfo();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b bg-white ${
        isPending ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isPending ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            {icon}
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{name}</h2>
            <div className="flex items-center space-x-2">
              {conv?.type === 'DIRECT' && (
                <p className="text-sm text-gray-500">
                  @{conv.participants.find(p => p.user.id !== user?.id)?.user.username}
                </p>
              )}
              {conv?.type === 'GROUP' && (
                <p className="text-sm text-gray-500">
                  {conv.participants.length} members
                </p>
              )}
            </div>
          </div>
        </div>

        {conv.type === 'GROUP' && (
          <button
            onClick={() => console.log('Open group settings')}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
          >
            <FiMoreVertical size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <MessageList
            messages={conversationMessages}
            conversationId={conversationId}
            conversationType={conv?.type || 'DIRECT'}
          />
        )}
      </div>

      {!isPending && (
        <MessageInput onSend={handleSendMessage} />
      )}
    </div>
  );
}

export default ConversationView;
