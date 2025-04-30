
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me about digital nomad destinations..."
          className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 focus:border-nomad-blue focus:ring focus:ring-nomad-blue/20 focus:outline-none transition-all"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-nomad-blue/30 border-t-nomad-blue rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className={`bg-gradient-to-r from-nomad-blue to-nomad-teal text-white rounded-full p-3
                    transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
