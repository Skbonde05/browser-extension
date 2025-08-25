import { useRef, useState } from "react";
import { FiSend } from "react-icons/fi";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSend, disabled = false }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4 bg-white">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled || sending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || sending || disabled}
          className={`p-2 rounded-lg transition-colors ${
            content.trim() && !sending && !disabled
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          style={{ marginBottom: '8px' }}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
          ) : (
            <FiSend size={18} />
          )}
        </button>
      </div>
    </form>
  );
}

export default MessageInput;
