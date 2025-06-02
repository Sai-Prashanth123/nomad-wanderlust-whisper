import React, { useState } from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw, Share, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DestinationDetail } from './ResponseHandler';
import ChatDestinationCard from './ChatDestinationCard';
import { ResponseHandler } from './ResponseHandler';
import { ChatInput } from './ChatInput';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  hasDestinations?: boolean;
  isTravel?: boolean;
  destinations?: DestinationDetail[];
}

interface ChatUIProps {
  messages: Message[];
  onRateMessage?: (messageId: string, rating: 'up' | 'down') => void;
  onCopyMessage?: (content: string) => void;
  onRegenerateResponse?: () => void;
  onShareMessage?: (messageId: string) => void;
  onQuickReply?: (content: string) => void;
  className?: string;
}

// List of common countries for quick replies when clarification is needed
const POPULAR_COUNTRIES = [
  "India", "Thailand", "Indonesia", "Mexico", "Portugal",
  "Colombia", "Hungary", "Europe", "Asia", "South America"
];

// Function to detect if a message is a clarification request
const isClarificationRequest = (content: string): boolean => {
  const clarificationPhrases = [
    "which country",
    "what country",
    "which region",
    "what region",
    "where would you",
    "specify a location",
    "specify which country",
    "could you tell me which"
  ];
  
  return clarificationPhrases.some(phrase => 
    content.toLowerCase().includes(phrase)
  );
};

export const ChatUI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Simulate API call - replace with your actual API call
      const response = await fetch('your-api-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      setCurrentResponse(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending message:', error);
      handleError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
    // Handle error (e.g., show toast notification)
  };

  const handleDestinationsLoaded = (destinations: any[]) => {
    console.log('Destinations loaded:', destinations);
    // Handle destinations loaded (e.g., update UI state)
  };

  const handleDestinationsError = (error: string) => {
    console.error('Destinations error:', error);
    // Handle destinations error
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "mb-4",
                message.role === "user" ? "flex justify-end" : "flex justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destinations Section - Outside Chat Container */}
      <div className="w-full bg-gray-50">
        <ResponseHandler
          response={currentResponse}
          isLoading={isLoading}
          onNewMessage={handleNewMessage}
          onError={handleError}
          onDestinationsLoaded={handleDestinationsLoaded}
          onDestinationsError={handleDestinationsError}
        />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatUI; 