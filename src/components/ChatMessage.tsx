import React from 'react';
import { DestinationDetail } from './ResponseHandler';


interface ChatMessageProps {
  message: string;
  isUser: boolean;
  animationDelay?: number;
  destinations?: DestinationDetail[];
  hasDestinations?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isUser, 
  animationDelay = 0,
  destinations,
  hasDestinations
}) => {
  const messageClass = isUser 
    ? "bg-[#C66E4F] text-white ml-auto" 
    : "bg-white border border-gray-200 mr-auto";

  return (
    <div 
      className={`max-w-[85%] rounded-2xl px-4 py-3 my-2 
                  animate-fade-in shadow-sm ${messageClass}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <p className={`text-sm md:text-base ${isUser ? 'text-white' : 'text-gray-900'}`}>{message}</p>
      
      {/* Destination Cards */}
      {!isUser && hasDestinations && destinations && destinations.length > 0 && (
        <div className="mt-4 space-y-4">
          {destinations.map((destination) => (
            <ChatDestinationCard
              key={destination.id}
              destination={destination}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
