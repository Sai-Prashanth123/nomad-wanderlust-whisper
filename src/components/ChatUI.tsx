import React from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw, Share, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DestinationDetail } from './ResponseHandler';

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
  onQuickReply?: (reply: string) => void;
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

const ChatUI: React.FC<ChatUIProps> = ({
  messages,
  onRateMessage,
  onCopyMessage,
  onRegenerateResponse,
  onShareMessage,
  onQuickReply,
  className
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    if (onCopyMessage) onCopyMessage(content);
  };

  return (
    <div className={cn("flex flex-col space-y-8", className)}>
      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-200 mb-2">Welcome to Wanderlust Whisper</h2>
          <p className="text-gray-400">Start a conversation about travel destinations, visa requirements, or get travel tips</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div key={message.id} className="w-full">
          {message.role === 'user' ? (
            /* User message - styled as darker bubble on right side */
            <div className="flex justify-end mb-4">
              <div className="flex items-start max-w-[80%]">
                <div className="bg-gray-700/60 rounded-2xl py-3 px-4">
                  <p className="text-gray-100 whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className="bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center text-white ml-2 flex-shrink-0">
                  <span className="text-sm">You</span>
                </div>
              </div>
            </div>
          ) : (
            /* AI message - styled to match the image */
            <div className="mb-4 px-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div className="text-xs text-gray-400">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  <div className={cn(
                    "text-gray-200 whitespace-pre-wrap leading-relaxed",
                    isClarificationRequest(message.content) && "border-l-4 border-nomad-blue pl-3 py-1"
                  )}>
                    {message.content}
                  </div>
                  
                  {/* Quick reply buttons for location clarification */}
                  {isClarificationRequest(message.content) && onQuickReply && index === messages.length - 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="w-full text-xs text-gray-400 mb-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> 
                        Quick replies:
                      </div>
                      {POPULAR_COUNTRIES.map(country => (
                        <Button
                          key={country}
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 text-xs rounded-full px-3 py-1 h-auto"
                          onClick={() => onQuickReply(country)}
                        >
                          {country}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Action buttons row */}
                  <div className="flex items-center mt-3 space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => onRateMessage && onRateMessage(message.id, 'up')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => onRateMessage && onRateMessage(message.id, 'down')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={onRegenerateResponse}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => onShareMessage && onShareMessage(message.id)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add a larger gap after each AI response except the last one */}
          {message.role === 'assistant' && index < messages.length - 1 && (
            <div className="h-6"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatUI; 