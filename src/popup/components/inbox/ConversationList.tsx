import React, { useState } from "react";
import { FiClock, FiMessageCircle } from "react-icons/fi";
import { useMessage } from "../../context/MessageContext";
import ConversationItem from "./ConversationItem";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList = ({onSelectConversation}: ConversationListProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  const { conversations,loading, pendingCount } = useMessage();
  const acceptedConversations = conversations.filter(c => c.status === 'ACCEPTED');
  const pendingConversations = conversations.filter(c => c.status === 'PENDING');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-fill flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <FiMessageCircle className="text-blue-600" size={20} />
          <h1 className="text-lg font-semibold text-gray-800">Messages</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Chats
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-3 text-sm font-medium relative ${
            activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-1">
            <FiClock size={14} />
            <span>Requests</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
                {pendingCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* conversations List */}
      <div>
        {activeTab === 'all' ? (
          acceptedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <FiMessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No conversations yet</h3>
              <p className="text-gray-500 mb-4 max-w-xs">
                Start a conversation with your friends or create a group chat
              </p>
            </div>
          ) : (
            acceptedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.conversation.id}
                conversation={conversation}
                onClick={() => {
                  console.log('ConversationList: Selecting conversation:', conversation.conversation.id);
                  onSelectConversation(conversation.conversation.id);
                }}
              />
            ))
          )
        ) : (
          pendingConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <FiClock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No pending requests</h3>
              <p className="text-gray-500 max-w-xs">
                Message requests from non-friends will appear here
              </p>
            </div>
          ) : (
            pendingConversations.map((conversation) => (
              <ConversationItem
                key={conversation.conversation.id}
                conversation={conversation}
                onClick={() => {
                  console.log('ConversationList: Selecting pending conversation:', conversation.conversation.id);
                  onSelectConversation(conversation.conversation.id);
                }}
                isPending={true}
              />
            ))
          )
        )}
      </div>
    </div>
  );
};

export default ConversationList;
