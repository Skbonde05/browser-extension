import React, { Children, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getConversationMessages, getUserConversations, sendMessage as apiSendMessage } from "../../services/api";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  seenAt?: string;
  deliveredAt?: string;
  status?: "sending" | "sent" | "delivered" | "seen";
  isDirectMessage?: boolean;
  readReceipts?: Array<{
    userId: string;
    readAt: string;
    user?: {
      id: string;
      username: string;
      displayName: string;
    };
  }>;
  readBy?: Array<{
    user: {
      id: string;
      username: string;
      displayName: string;
    };
    readAt: string;
  }>;
  sender: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface Conversation {
  id: string;
  conversation: {
    id: string;
    type: "DIRECT" | "GROUP";
    name?: string;
    lastMessage?: Message;
    participants: Array<{
      status: "ACCEPTED" | "PENDING";
      user: {
        id: string;
        username: string;
        displayName: string;
      };
    }>;
  };
  status: "ACCEPTED" | "PENDING";
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  loading: boolean;
  pendingCount: number;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (data: {
    conversationId?: string;
    receiverId?: string;
    content: string;
  }) => Promise<{
    success: boolean;
    conversationId?: string;
    isNewConversation?: boolean;
    data?: any;
    message?: string;
  }>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  const pendingCount = conversations.filter(c => c.status === 'PENDING').length;

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
        setLoading(true);
        const response = await getUserConversations(user.token);
        if (response.success) {
            setConversations(response.data);
        }
    } catch (error) {
        console.error("Failed to load conversations:", error);
    } finally {
        setLoading(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const response = await getConversationMessages(conversationId, user.token);
      if (response.success) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [conversationId]: response.data || []
        }));

        console.log(`Loaded messages for conversation ${conversationId}`, response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [user]);

  const sendMessage = useCallback(async (data: { conversationId?: string; receiverId?: string; content: string }) => {
    if (!user) return { success: false, message: "User not authenticated" };

    // Create optimistic message
    const tempId = `temp-${user.id}-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: data.conversationId || "",
      senderId: user.id,
      content: data.content,
      createdAt: new Date().toISOString(),
      status: "sending",
      sender: {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username
      }
    };

    if (data.conversationId) {
      setMessages(prevMessages => ({
        ...prevMessages,
        [data.conversationId!]: [...(prevMessages[data.conversationId!] || []), optimisticMessage]
      }))
    }

    try {
      const response = await apiSendMessage(data, user.token);
      
      if (response.success) {
        const { conversationId, isNewConversation } = response;
        
        if (data.conversationId) {
          const realMessage = response.data;
          setMessages(prev => ({
            ...prev,
            [data.conversationId!]: prev[data.conversationId!].map(msg => 
              msg.id === tempId ? { ...realMessage, status: 'sent' } : msg
            )
          }));
        }
      
        if (isNewConversation && conversationId) {
          console.log('MessageContext: New conversation created, loading data');
          await loadConversations();
          await loadMessages(conversationId);
        }
        
        return {
          success: true,
          conversationId,
          isNewConversation,
          data: response.data
        };
      } else {
        if (data.conversationId) {
          setMessages(prev => ({
            ...prev,
            [data.conversationId!]: prev[data.conversationId!].filter(msg => msg.id !== tempId)
          }));
        }
        
        console.error('MessageContext: Failed to send message:', response);
        return {
          success: false,
          message: response.message || 'Failed to send message'
        };
      }
    } catch (error) {
      if (data.conversationId) {
        setMessages(prev => ({
          ...prev,
          [data.conversationId!]: prev[data.conversationId!].filter(msg => msg.id !== tempId)
        }));
      }
      
      console.error('MessageContext: Error sending message:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }

  }, [user, loadConversations, loadMessages]);

  useEffect(() => {
    if (user) {
        loadConversations();
    }
  }, [user, loadConversations]);

  return (
    <MessageContext.Provider value={{
        conversations,
        messages,
        loading,
        loadConversations,
        loadMessages,
        pendingCount,
        sendMessage
    }}>
        {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
