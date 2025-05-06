import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  Plus, 
  ChevronDown,
  Bot,
  Loader2,
  MapPin
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './ChatUI';
import { useChatContext, Destination } from './Layout';
import { useAuth } from '@/hooks/useAuth';
import ResponseHandler, { DestinationDetail } from './ResponseHandler';

// Define the backend API URL
const API_URL = 'https://nomadtravel.azurewebsites.net/';

// Helper function for API calls
const callSearchAPI = async (query: string, sessionId: string | null) => {
  const payload = {
    query,
    ...(sessionId && { session_id: sessionId })
  };
  
  try {
    console.log(`Making API request to ${API_URL}search with payload:`, payload);
    const response = await fetch(`${API_URL}search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to get response from API: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

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

// Extend the Message type to include destinations and travel flag
interface MessageWithDestinations extends Message {
  destinations?: DestinationDetail[];
  isTravel?: boolean;
}

const ChatHome = () => {
  const { 
    chatSessions, 
    activeChatId, 
    isNewChatActive, 
    loading,
    updateChatMessages,
    createNewChat,
    updateChatDestinations
  } = useChatContext();
  
  const { currentUser } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Get current chat's messages
  const currentChatSession = chatSessions.find(chat => chat.id === activeChatId);
  const messages = currentChatSession ? currentChatSession.messages : [];
  
  // Update chat destinations when active chat changes
  useEffect(() => {
    if (currentChatSession && currentChatSession.destinations && currentChatSession.destinations.length > 0) {
      console.log(`Loaded ${currentChatSession.destinations.length} destinations for chat ${activeChatId}`);
      
      // Find the latest travel message with destinations and update it if needed
      const travelMessages = messages.filter(msg => msg.isTravel && (!msg.destinations || msg.destinations.length === 0));
      
      if (travelMessages.length > 0) {
        console.log("Found travel messages without destination data, updating from chat-level data");
        const updatedMessages = messages.map(msg => {
          if (msg.isTravel && (!msg.destinations || msg.destinations.length === 0)) {
            return {
              ...msg,
              destinations: currentChatSession.destinations
            };
          }
          return msg;
        });
        
        if (activeChatId) {
          updateChatMessages(activeChatId, updatedMessages);
        }
      }
    }
  }, [activeChatId, currentChatSession]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;
    
    // If there's no active chat, create a new one
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createNewChat();
      if (!chatId) return; // Exit if chat creation failed
    }
    
    // Create a copy of the current messages
    const updatedMessages = [...messages];
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    updatedMessages.push(userMessage);
    // Update the chat with the new message
    updateChatMessages(chatId, updatedMessages);
    
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Call the backend API to process the prompt
      const data = await callSearchAPI(userMessage.content, chatId);
      
      // Determine if this is a travel response or general response
      const isTravelResponse = 'cities' in data && Array.isArray(data.cities) && data.cities.length > 0;
      
      // Create AI response message with travel flag and destinations if applicable
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.friendlyAiReply || data.query || "I found some information for you!",
        role: 'assistant',
        timestamp: new Date(),
        isTravel: isTravelResponse,
        destinations: isTravelResponse ? data.cities : undefined
      };
      
      // Update chat with AI response
      const finalMessages = [...updatedMessages, aiMessage];
      updateChatMessages(chatId, finalMessages);
      
      // Also update the chat context destinations for backward compatibility if it's a travel response
      if (isTravelResponse && Array.isArray(data.cities)) {
        try {
          const destinations: Destination[] = data.cities.map((dest: any) => ({
            ...dest,
            image: dest.imageUrl || ''
          }));
          
          updateChatDestinations(chatId, destinations);
        } catch (destError) {
          console.error('Error processing destinations:', destError);
        }
      }
      
    } catch (error) {
      console.error('Error processing prompt:', error);
      
      // Fallback response in case of API error with more specific message
      const errorMessage: Message = {
        id: uuidv4(),
        content: error instanceof Error && error.message.includes('travel')
          ? "I'm having trouble finding travel destinations right now. Could you try a more general query or try again later?"
          : "I'm sorry, I encountered an error processing your request. Please try again with a different question.",
        role: 'assistant',
        timestamp: new Date(),
        isTravel: false
      };
      
      // Update chat with error message
      const finalMessages = [...updatedMessages, errorMessage];
      updateChatMessages(chatId, finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRateMessage = (messageId: string, rating: 'up' | 'down') => {
    console.log(`Message ${messageId} rated ${rating}`);
  };

  const handleCopyMessage = (content: string) => {
    console.log(`Message copied: ${content.substring(0, 20)}...`);
  };

  const handleRegenerateResponse = async () => {
    if (!activeChatId || !messages.length || !currentUser) return;
    
    // Remove the last AI message
    const newMessages = [...messages];
    
    let lastUserMessage = '';
    for (let i = newMessages.length - 1; i >= 0; i--) {
      if (newMessages[i].role === 'assistant') {
        newMessages.splice(i, 1);
      } else if (newMessages[i].role === 'user') {
        lastUserMessage = newMessages[i].content;
        break;
      }
    }
    
    if (!lastUserMessage) return;
    
    // Update chat without the last AI message
    updateChatMessages(activeChatId, newMessages);
    setIsTyping(true);
    
    try {
      // Call the backend API to regenerate the response
      const data = await callSearchAPI(lastUserMessage, activeChatId);
      
      // Determine if this is a travel response or general response
      const isTravelResponse = 'cities' in data && Array.isArray(data.cities) && data.cities.length > 0;
      
      // Create AI response message with travel flag and destinations if applicable
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.friendlyAiReply || data.query || "I found some information for you!",
        role: 'assistant',
        timestamp: new Date(),
        isTravel: isTravelResponse,
        destinations: isTravelResponse ? data.cities : undefined
      };
      
      // Update chat with AI response
      updateChatMessages(activeChatId, [...newMessages, aiMessage]);
      
      // Also update the chat context destinations for backward compatibility if it's a travel response
      if (isTravelResponse && Array.isArray(data.cities)) {
        try {
          const destinations: Destination[] = data.cities.map((dest: any) => ({
            ...dest,
            image: dest.imageUrl || ''
          }));
          
          updateChatDestinations(activeChatId, destinations);
        } catch (destError) {
          console.error('Error processing destinations:', destError);
        }
      }
      
    } catch (error) {
      console.error('Error regenerating response:', error);
      
      // Fallback response in case of API error
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error regenerating the response. Please try again later.",
        role: 'assistant',
        timestamp: new Date(),
        isTravel: false
      };
      
      // Update chat with error message
      updateChatMessages(activeChatId, [...newMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShareMessage = (messageId: string) => {
    console.log(`Message ${messageId} shared`);
  };

  // Add handleQuickReply function
  const handleQuickReply = async (reply: string) => {
    if (!inputValue && reply) {
      setInputValue(reply);
      // Auto-submit after a short delay to allow the UI to update
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
      }, 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Show scroll down button when not at bottom
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  };

  // Format time for chat messages
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render a loading state if chatSessions are being loaded
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading your chats...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden text-gray-200">
      {/* Main chat area */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin 
                  scrollbar-thumb-gray-700 scrollbar-track-transparent"
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto">
          {/* Welcome message when no messages */}
          {messages.length === 0 && (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-200 mb-2">Welcome to Wanderlust Whisper</h2>
              <p className="text-gray-400">Start a conversation about travel destinations, visa requirements, or get travel tips</p>
            </div>
          )}
          
          {/* Render messages and typing indicator */}
          <div className="flex flex-col space-y-8">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  /* User message - styled as darker bubble on right side */
                  <div className="flex justify-end mb-4">
                    <div className="flex items-start max-w-[80%]">
                      <div className="bg-gray-700/60 rounded-2xl py-3 px-4">
                        <p className="text-gray-100 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI message with ResponseHandler */
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
                        
                        {/* Use ResponseHandler component to render AI responses */}
                        <ResponseHandler 
                          content={message.content}
                          isTravel={message.isTravel || false}
                          destinations={message.destinations || []}
                          onRateMessage={(rating) => handleRateMessage(message.id, rating)}
                          onCopyMessage={() => handleCopyMessage(message.content)}
                        />
                        
                        {/* Quick reply buttons for location clarification */}
                        {isClarificationRequest(message.content) && (
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
                                onClick={() => handleQuickReply(country)}
                              >
                                {country}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        
            {/* AI is typing indicator */}
            {isTyping && (
              <div className="flex items-center text-gray-400 mt-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            )}
          </div>
        
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Scroll down button */}
      {showScrollDown && (
        <Button 
          className="absolute bottom-24 right-8 rounded-full bg-gray-800 hover:bg-gray-700"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      )}
      
      {/* Chat input */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Message Wanderlust Whisper..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl pr-10 focus-visible:ring-purple-500"
              disabled={isTyping || !currentUser}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            type="submit" 
            className="rounded-xl text-white bg-gradient-to-r from-nomad-blue to-nomad-teal hover:opacity-90"
            disabled={!inputValue.trim() || isTyping || !currentUser}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatHome; 