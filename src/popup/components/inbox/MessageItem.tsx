interface MessageItemProps {
  message: any;
  isOwn: boolean;
  isLast: boolean;
  conversationType: 'DIRECT' | 'GROUP';
}

const MessageItem = ({
  message,
  isOwn,
  isLast,
  conversationType
}: MessageItemProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        {!isOwn && conversationType === 'GROUP' && (
          <div className="text-xs font-medium mb-1 opacity-75">
            {message.sender.displayName || message.sender.username}
          </div>
        )}
        
        <div className="text-sm">{message.content}</div>
        
        <div className={`flex items-center justify-between mt-2 ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <span className={`text-xs ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
