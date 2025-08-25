import React from 'react';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { useMessage } from '../../context/MessageContext';
import MessageInput from './MessageInput';

interface NewConversationViewProps {
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  onBack: () => void;
  onConversationCreated: (conversationId: string) => void;
}

const NewConversationView: React.FC<NewConversationViewProps> = ({
  receiverId,
  receiverName,
  receiverUsername,
  onBack,
  onConversationCreated
}) => {
  const { sendMessage } = useMessage();

  const handleSendMessage = async (content: string) => {
    try {
      console.log('NewConversationView: Sending message to:', receiverId, 'Content:', content);
      
      const response = await sendMessage({
        receiverId,
        content
      });

      console.log('NewConversationView: Send message response:', response);

      if (response && response.success && response.conversationId) {
        console.log('NewConversationView: Message sent successfully, conversation ID:', response.conversationId);
        onConversationCreated(response.conversationId);
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('NewConversationView: Error sending message:', error);
      throw error;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>
        
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600">
          <span className="text-sm font-bold text-white">
            {getInitials(receiverName)}
          </span>
        </div>
        
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{receiverName}</h2>
          <p className="text-sm text-gray-500">@{receiverUsername}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="text-center">
          {/* Large Profile Picture */}
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {getInitials(receiverName)}
            </span>
          </div>

          {/* Simple Message */}
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Say hello to {receiverName}! 👋
          </h3>
          <p className="text-gray-600">
            Start your conversation below
          </p>
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};

export default NewConversationView;