
import React from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  animationDelay?: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, animationDelay = 0 }) => {
  const messageClass = isUser 
    ? "bg-nomad-blue text-white ml-auto" 
    : "bg-white border border-gray-100 mr-auto";

  return (
    <div 
      className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 my-2 
                  animate-fade-in shadow-sm ${messageClass}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <p className="text-sm md:text-base">{message}</p>
    </div>
  );
};

export default ChatMessage;
