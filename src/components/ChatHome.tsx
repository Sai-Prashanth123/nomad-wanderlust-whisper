import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mic,
  Plus,
  ChevronDown,
  Bot,
  Loader2,
  MapPin,
  User,
  Heart,
  DollarSign,
  Wifi,
  Globe,
  Shield
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './ChatUI';
import { useChatContext, Destination } from './Layout';
import { useAuth } from '@/hooks/useAuth';
import ResponseHandler, { DestinationDetail, FavoritesContext } from './ResponseHandler';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import GuestWelcome from './GuestWelcome';
import { DestinationDetailsModal } from './DestinationDetailsModal';
import FavoritesDashboard from './FavoritesDashboard';
import TripPlanningModal from './TripPlanningModal';

// Utility functions for formatting destination card data
const getCostColor = (cost: string) => {
  if (cost.toLowerCase() === 'low') return 'text-green-400';
  if (cost.toLowerCase() === 'medium') return 'text-yellow-400';
  return 'text-red-400';
};

const getInternetColor = (internet: string) => {
  if (internet.toLowerCase().includes('fast')) return 'text-green-400';
  if (internet.toLowerCase().includes('moderate')) return 'text-yellow-400';
  return 'text-red-400';
};

// Define the backend API URL
const API_URL = 'http://localhost:8000/';

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

// Add this function after the other utility functions but before the ChatHome component
const formatAIResponse = (content: string): React.ReactNode => {
  // Don't format if content is very short
  if (content.length < 50) return content;
  
  // Split the content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  // If there's only one short paragraph, return it as is
  if (paragraphs.length === 1 && paragraphs[0].length < 100) {
    return paragraphs[0];
  }
  
  // Process each paragraph
  return (
    <div className="ai-formatted-response">
      {paragraphs.map((paragraph, index) => {
        // Check if this is a heading (ends with ":" or has markdown heading format)
        if (paragraph.trim().endsWith(':') || paragraph.includes('**') || /^#+\s/.test(paragraph)) {
          // Clean up the heading text
          let headingText = paragraph.trim();
          headingText = headingText.replace(/^\#+\s/, ''); // Remove markdown heading syntax
          headingText = headingText.replace(/\*\*/g, ''); // Remove bold markdown
          
          return (
            <h3 key={index} className="text-[#171616] font-semibold mt-3 mb-2">
              {headingText}
            </h3>
          );
        }
        
        // Check if paragraph contains a list (numbered or bullet points)
        if (paragraph.includes('- ') || /^\d+\./.test(paragraph)) {
          // Split into list items
          const items = paragraph.split('\n').filter(item => item.trim());
          
          return (
            <ul key={index} className="list-disc pl-5 space-y-1 my-2">
              {items.map((item, itemIndex) => {
                // Clean up the item text
                let itemText = item.trim().replace(/^-\s/, '').replace(/^\d+\.\s/, '');
                
                return (
                  <li key={itemIndex} className="text-gray-800">
                    {itemText}
                  </li>
                );
              })}
            </ul>
          );
        }
        
        // For comparison sections (like the one in the example)
        if (paragraph.includes('###')) {
          const sections = paragraph.split('###').filter(s => s.trim());
          
          return (
            <div key={index} className="my-3">
              {sections.map((section, sectionIndex) => {
                // Extract section number and title if present
                const match = section.match(/^\s*(\d+)\.\s*\*\*(.*?)\*\*/);
                
                if (match) {
                  const [, number, title] = match;
                  const content = section.replace(/^\s*\d+\.\s*\*\*(.*?)\*\*/, '').trim();
                  
                  return (
                    <div key={sectionIndex} className="mb-2">
                      <h4 className="font-medium text-[#C66E4F]">
                        {number}. {title}
                      </h4>
                      <p className="text-gray-800">{content}</p>
                    </div>
                  );
                }
                
                return <p key={sectionIndex} className="text-gray-800 my-2">{section.trim()}</p>;
              })}
            </div>
          );
        }
        
        // Regular paragraphs get converted to bullet points if they're not too long
        if (paragraph.length < 200 && !paragraph.startsWith('Here')) {
          return (
            <div key={index} className="flex my-2">
              <span className="text-[#C66E4F] mr-2">•</span>
              <p className="text-gray-800">{paragraph}</p>
            </div>
          );
        }
        
        // Long paragraphs remain as paragraphs
        return <p key={index} className="text-gray-800 my-2">{paragraph}</p>;
      })}
    </div>
  );
};

const ChatHome = () => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DestinationDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favoritesDashboardOpen, setFavoritesDashboardOpen] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    chatSessions,
    activeChatId,
    isNewChatActive,
    loading,
    updateChatMessages,
    createNewChat,
    updateChatDestinations
  } = useChatContext();

  const { currentUser, isGuestUser } = useAuth();

  // Get favorites context
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  // Get current chat's messages
  const currentChatSession = chatSessions.find(chat => chat.id === activeChatId);
  const messages = currentChatSession ? currentChatSession.messages : [];

  // Get user's name from email (take everything before @)
  const userName = currentUser?.email
    ? currentUser.email.split('@')[0].split('.').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
    : 'Guest';

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

  // Update scroll detection for window scrolling
  useEffect(() => {
    const handleWindowScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      // Show scroll button when not near the bottom
      setShowScrollDown(scrollHeight - scrollPosition - windowHeight > 100);
    };

    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

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

    setIsTyping(true); // Set typing state before chat creation

    try {
      // If there's no active chat, create a new one
      let chatId = activeChatId;
      if (!chatId) {
        const newChatId = await createNewChat();
        if (!newChatId) {
          setIsTyping(false); // Reset typing state if chat creation fails
          return;
        }
        chatId = newChatId;
      }

      // Create a copy of the current messages
      const currentMessages = currentChatSession?.messages || [];
      const updatedMessages = [...currentMessages];

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

        // Update messages with AI response
        const newMessages = [...updatedMessages, aiMessage];
        updateChatMessages(chatId, newMessages);

        // Update chat destinations if this is a travel response
        if (isTravelResponse && data.cities) {
          updateChatDestinations(chatId, data.cities);
        }

      } catch (error) {
        console.error('Error getting AI response:', error);

        // Add error message to chat
        const errorMessage: Message = {
          id: uuidv4(),
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          role: 'assistant',
          timestamp: new Date()
        };

        updateChatMessages(chatId, [...updatedMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
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
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Format time for chat messages
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenDetailsModal = (destination: DestinationDetail) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedDestination(null);
  };

  const handleToggleFavorite = (e: React.MouseEvent, destination: DestinationDetail) => {
    e.stopPropagation(); // Prevent the click from triggering parent elements
    toggleFavorite(destination);
  };

  const handleStartPlanning = (destination: DestinationDetail) => {
    // Ensure safetyRating is a number for compatibility with TripPlanningModal
    const formattedDestination = {
      ...destination,
      // Convert safetyRating to number if it's a string
      safetyRating: typeof destination.safetyRating === 'string' 
        ? parseInt(destination.safetyRating, 10) || 4 
        : destination.safetyRating
    };
    setSelectedDestination(formattedDestination);
    setIsPlanningModalOpen(true);
  };

  const handleClosePlanningModal = () => {
    setIsPlanningModalOpen(false);
    setSelectedDestination(null);
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

  // Show guest welcome screen only for first-time guest users with no messages
  if (!messages.length && isGuestUser && !activeChatId) {
    return <GuestWelcome />;
  }

  // Show empty state for logged-in users with no messages
  if (!messages.length && currentUser && !isGuestUser && !activeChatId) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white pt-[72px]">
        <img
          src="/Preview.png"
          alt="Nomadic Trails Welcome"
          className="w-16 h-16 mb-6"
        />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Welcome back {userName}
        </h1>
        <p className="text-gray-600 mb-8 max-w-md text-center">
          Discover destinations made just for you.
        </p>


        {/* Chat Input */}
        <div className="sticky bottom-0 bg-white px-4 py-4 border-t border-gray-100 shadow-lg">
          <form onSubmit={handleSubmit} className="relative max-w-[1200px] mx-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "p-2 text-gray-500 hover:text-gray-700 transition-colors",
                  !currentUser && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => console.log('Add attachments')}
                disabled={!currentUser}
              >
                <Plus className="h-5 w-5" />
              </button>

              <div className="flex-1 flex items-center h-[56px] bg-white border border-[#CFCFCF] rounded-[12px] overflow-hidden focus-within:border-[#C66E4F] transition-colors">
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Discover destinations made just for you"
                  className={cn(
                    "flex-1 h-full bg-transparent border-0 focus:ring-0 focus:outline-none px-4",
                    "placeholder:text-[#B3B3B3]",
                    isTyping && "opacity-75"
                  )}
                  disabled={!currentUser || isTyping}
                />
              </div>

              <button
                type="submit"
                className={cn(
                  "w-[60px] h-[56px] flex items-center justify-center rounded-xl bg-[#C66E4F] hover:bg-[#B85E34] transition-colors relative",
                  (!currentUser || !inputValue.trim() || isTyping) && "opacity-50 cursor-not-allowed"
                )}
                disabled={!currentUser || !inputValue.trim() || isTyping}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {isTyping ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <img
                      src="/Vector.png"
                      alt="Send message"
                      className="w-5 h-5"
                      style={{
                        filter: 'brightness(0) invert(1)' // Makes the image white
                      }}
                    />
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!currentUser) {
    return <GuestWelcome />;
  }

  return (
    <div className="flex flex-col min-h-screen pt-[72px]">
      {/* Messages area - removed overflow-y-auto */}
      <div
        className="flex-1 px-6 py-4 space-y-6"
      >
        {/* Welcome message - shown when no messages exist */}
        {!messages.length && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <img
              src="/Preview.png"
              alt="Nomadic Trails"
              className="w-16 h-16 mb-6"
            />
            <h1 className="text-2xl font-bold mb-2 text-gray-800">
              Welcome back {isGuestUser ? 'Guest' : userName}
            </h1>
            <p className="text-gray-600">
              Discover destinations made just for you.
            </p>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((message, i) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} relative animate-fade-in`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mr-4">
                <img
                  src="/AI Avatar.png"
                  alt="AI"
                  className="w-10 h-10 rounded-full"
                />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl p-4",
                message.role === 'user'
                  ? "max-w-3xl text-[#1B1B3D] bg-[#d1aea1]"  // keep user messages at current max width with new background color
                  : "max-w-5xl bg-transparent text-gray-800 rounded-tl-none"  // increased from max-w-3xl to max-w-5xl
              )}
              style={
                message.role === 'user'
                  ? {
                    width: '299px',
                    height: '60px',
                    borderRadius: '14px 0px 14px 14px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                  }
                  : {}
              }
            >
              <div className="prose prose-sm max-w-none">
                {message.role === 'assistant' 
                  ? formatAIResponse(message.content)
                  : message.content}
              </div>


              {/* For AI messages with destinations, render destination cards */}
              {message.isTravel && message.destinations && message.destinations.length > 0 && (
                <div className="px-4">
                  <div className="mt-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Suggested Destinations for You</h2>
                      <p className="text-sm text-gray-600">
                        Personalized recommendations based on your preferences and search history.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {message.destinations.map((destination) => (
                        <div
                          key={destination.id}
                          className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                          style={{ width: "308px", height: "462px", borderRadius: "10px", border: "1px solid #D7D7D7", background: "#FFF" }}
                        >
                          <div className="flex justify-center px-2 mt-2">
                            <div className="relative w-[288px] h-[175px] flex-shrink-0 rounded-[8px] overflow-hidden bg-[#BDBDBD]">
                              {destination.imageUrl && (
                                <img
                                  src={destination.imageUrl}
                                  alt={destination.name}
                                  className="w-full h-full object-cover"
                                />
                              )}

                              {/* Favorite button */}
                              <button
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors duration-200"
                                onClick={(e) => handleToggleFavorite(e, destination)}
                              >
                                <Heart
                                  className={`h-4 w-4 ${isFavorite(destination.id) ? 'text-[#C66E4F]' : 'text-gray-500'} transition-colors duration-200`}
                                  fill={isFavorite(destination.id) ? '#C66E4F' : 'none'}
                                />
                              </button>

                              {/* Country pill */}
                              <div className="absolute bottom-2 left-2 flex items-start px-[10px] py-[4px] rounded-full bg-white">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-black" />
                                  <span className="text-xs text-black">{destination.country}</span>
                                </div>
                              </div>
                            </div>
                          </div>



                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-xl mb-4">{destination?.name || 'Destination'}</h3>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                              {/* Cost */}
                              <div>
                                <div className="flex items-center text-gray-500 mb-1">
                                  <DollarSign className={`w-3 h-3 mr-1 ${getCostColor(destination?.costOfLiving)}`} />
                                  <span>Cost</span>
                                </div>
                                <div className="font-semibold text-gray-900 capitalize">{destination?.costOfLiving || 'Low'}</div>
                              </div>

                              {/* Wi-Fi */}
                              <div>
                                <div className="flex items-center text-gray-500 mb-1">
                                  <Wifi className={`w-3 h-3 mr-1 ${getInternetColor(destination?.internetSpeed)}`} />
                                  <span>Wi-Fi</span>
                                </div>
                                <div className="font-semibold text-gray-900">
                                  {destination?.internetSpeed?.includes('Mbps')
                                    ? destination.internetSpeed
                                    : destination?.internetSpeed?.toLowerCase().includes('fast')
                                      ? '30-40 Mbps'
                                      : destination?.internetSpeed?.toLowerCase().includes('moderate')
                                        ? '< 10 Mbps'
                                        : '30-40 Mbps'}
                                </div>
                              </div>

                              {/* Visa */}
                              <div>
                                <div className="flex items-center text-gray-500 mb-1">
                                  <Globe className="w-3 h-3 mr-1 text-blue-500" />
                                  <span>Visa</span>
                                </div>
                                <div className="font-semibold text-gray-900">{destination?.visaRequirements || 'Easy'}</div>
                              </div>

                              {/* Safety */}
                              <div>
                                <div className="flex items-center text-gray-500 mb-1">
                                  <Shield className="w-3 h-3 mr-1 text-green-500" />
                                  <span>Safety</span>
                                </div>
                                <div className="font-semibold text-gray-900">{destination?.safetyRating?.toString() || '4'}</div>
                              </div>
                            </div>

                            {/* Note without background and moved slightly up */}
                            <div className="mb-4 relative -mt-2">
                              <p className="text-[12px] leading-[1.44] font-normal text-[rgba(198,110,78,0.70)] font-inter italic">
                                {destination?.description || destination?.insiderTip || "Note: Visit Bambolim Beach early morning for a peaceful sunrise experience."}
                              </p>
                            </div>


                            {/* Action buttons with fixed width and flex content */}
                            <div className="flex gap-3">
                              <button
                                className="w-[130px] flex justify-center items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
                                onClick={() => handleOpenDetailsModal && handleOpenDetailsModal(destination)}
                              >
                                More details
                              </button>
                              <button
                                className="w-[130px] flex justify-center items-center gap-2 px-4 py-2 bg-[#C66E4E] text-white rounded-md font-medium text-sm hover:bg-[#A75A3D] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartPlanning(destination);
                                }}
                              >
                                Start Planning
                              </button>
                            </div>
                          </div>


                          {/* Bottom corner indicator */}

                        </div>

                      ))}
                    </div>
                  </div>
                </div>

              )}

              {/* Quick country replies for clarification requests */}
              {message.role === 'assistant' && isClarificationRequest(message.content) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {POPULAR_COUNTRIES.map(country => (
                    <button
                      key={country}
                      onClick={() => handleQuickReply(country)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-full px-3 py-1 transition-colors"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 ml-4">
                <img
                  src="/image.png"
                  alt="User"
                  className="w-12 h-12 rounded-full border border-gray-300"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '48px',
                    border: '1px solid #E2E8F0',
                    flexShrink: 0,
                  }}
                />
              </div>
            )}
            {message.role === 'user' && i < messages.length - 1 && (
              <div className="text-xs text-gray-500 absolute -bottom-5 right-14">
                {formatTime(message.timestamp)}
              </div>
            )}
            {message.role === 'assistant' && i < messages.length - 1 && (
              <div className="text-xs text-gray-500 absolute -bottom-5 left-14">
                {formatTime(message.timestamp)}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll down button */}
      {showScrollDown && (
        <button
          className="fixed bottom-28 right-6 bg-white shadow-md rounded-full p-2 text-primary hover:bg-gray-100 transition-all z-20"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      )}

      {/* Destination Details Modal */}
      <DestinationDetailsModal
        destination={selectedDestination}
        open={isModalOpen}
        onClose={handleCloseDetailsModal}
      />

      {/* Favorites Dashboard */}
      <FavoritesDashboard
        isOpen={favoritesDashboardOpen}
        onClose={() => setFavoritesDashboardOpen(false)}
      />

      {/* Trip Planning Modal */}
      <TripPlanningModal
        destination={selectedDestination}
        open={isPlanningModalOpen}
        onClose={handleClosePlanningModal}
      />

      {/* Input area */}
      <div className="sticky bottom-0 bg-white px-4 py-4 border-t border-gray-100 shadow-lg">
        <form onSubmit={handleSubmit} className="relative max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(
                "p-2 text-gray-500 hover:text-gray-700 transition-colors",
                !currentUser && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => console.log('Add attachments')}
              disabled={!currentUser}
            >
              <Plus className="h-5 w-5" />
            </button>

            <div className="flex-1 flex items-center h-[56px] bg-white border border-[#CFCFCF] rounded-[12px] overflow-hidden focus-within:border-[#C66E4F] transition-colors">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Discover destinations made just for you"
                className={cn(
                  "flex-1 h-full bg-transparent border-0 focus:ring-0 focus:outline-none px-4",
                  "placeholder:text-[#B3B3B3]",
                  isTyping && "opacity-75"
                )}
                disabled={!currentUser || isTyping}
              />
            </div>

            <button
              type="submit"
              className={cn(
                "w-[60px] h-[56px] flex items-center justify-center rounded-xl bg-[#C66E4F] hover:bg-[#B85E34] transition-colors relative",
                (!currentUser || !inputValue.trim() || isTyping) && "opacity-50 cursor-not-allowed"
              )}
              disabled={!currentUser || !inputValue.trim() || isTyping}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {isTyping ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <img
                    src="/Vector.png"
                    alt="Send message"
                    className="w-5 h-5"
                    style={{
                      filter: 'brightness(0) invert(1)' // Makes the image white
                    }}
                  />
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatHome; 