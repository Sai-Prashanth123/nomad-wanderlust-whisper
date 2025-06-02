import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Menu, Search, ChevronDown, MessageSquare, UserPlus, Heart, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define API_URL for guest chat functionality
const API_URL = 'https://nomadtravel.azurewebsites.net/';

// Helper function for API calls
const callSearchAPI = async (query: string) => {
  const payload = { query };
  
  try {
    console.log(`Making guest API request to ${API_URL}search with payload:`, payload);
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
    console.log('Guest API response:', data);
    return data;
  } catch (error) {
    console.error('Guest API call failed:', error);
    throw error;
  }
};

const GuestWelcome = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Add state for sidebar control
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favoritesDashboardOpen, setFavoritesDashboardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsTyping(true);
    
    // Add user message
    const userMessage = {
      id: uuidv4(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    
    try {
      // Call the backend API to process the prompt
      const data = await callSearchAPI(userMessage.content);
      
      // Create AI response message
      const aiMessage = {
        id: uuidv4(),
        content: data.friendlyAiReply || data.query || "I found some information for you!",
        role: 'assistant',
        timestamp: new Date(),
        isTravel: 'cities' in data && Array.isArray(data.cities) && data.cities.length > 0,
        destinations: 'cities' in data ? data.cities : undefined
      };
      
      // Add AI response to messages
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        id: uuidv4(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Format time for chat messages
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[275.896px] bg-white/95 backdrop-blur-lg border-r border-gray-200/50 transition-all duration-500 ease-in-out flex flex-col shadow-xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "animate-in slide-in-from-left duration-500"
        )}
      >
        {/* Sidebar Header with glass effect */}
        <div className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-300 px-4 py-2 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="p-1 h-[38px] w-[38px] hover:bg-gray-100/60 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center" 
              >
                <Menu className="h-10 w-7 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200/50 mt-[62px]">
          <Button
            onClick={handleNewChat}
            className="
            w-[200px]
            h-[39px]
            flex-shrink-0
            rounded-[8px]
            bg-[#C66E4F]
            text-white
            flex items-center justify-center gap-2
            transition-all duration-300 ease-in-out
            transform
            hover:scale-[1.02]
            hover:shadow-lg
            group
          "
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">New Chat</span>
          </Button>
        </div>

        {/* Guest Chat History - Show current session */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#C66E4E]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#C66E4E]/30 transition-colors duration-300">
          {messages.length > 0 ? (
            <>
              <div className="px-3 pt-2 pb-1 text-xs font-medium text-gray-500 uppercase">Current Session</div>
              <div className="px-2">
                {messages.filter(msg => msg.role === 'user').map((message, index) => (
                  <div
                    key={message.id}
                    className="p-3 m-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <div className="text-sm text-gray-700 truncate">
                      {message.content.substring(0, 50)}...
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm text-gray-600">No chats yet</p>
              <p className="text-xs text-gray-500 mt-1">Start a conversation</p>
            </div>
          )}
        </div>

        {/* Search Bar with glass effect */}
        <div className="p-4 border-t border-gray-200/50 bg-white/70 backdrop-blur-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[14.712px] w-[14.712px] text-black/60 transition-colors duration-300" />
            <Input
              type="text"
              placeholder="Search requires sign in..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled
              className="w-[200px] h-[38px] flex-shrink-0 pl-9 pr-4 bg-white/50 backdrop-blur-sm border border-black rounded-md transition-all duration-300 hover:bg-white/70 opacity-50"
              style={{
                color: 'rgba(0, 0, 0, 0.70)',
                fontFamily: 'Inter',
                fontSize: '11.53px',
                fontWeight: '500',
                lineHeight: '10.329px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-500 ease-in-out bg-gradient-to-br from-white to-gray-50",
          sidebarOpen ? "ml-[275.896px]" : "ml-0"
        )}
      >
        {/* Top Bar with glass effect */}
        <div
          className={`fixed top-0 z-50 h-16 bg-white/20 shadow-md transition-all duration-300 ${sidebarOpen ? 'left-64 w-[calc(100%-16rem)]' : 'left-0 w-full'
            }`}
        >
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center gap-3">
              {/* Only show menu icon when sidebar is closed */}
              {!sidebarOpen && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="p-1 hover:bg-gray-100/50 rounded-lg transition-all duration-300"
                  >
                    <Menu className="h-5 w-5 text-gray-600" />
                  </Button>
                  <img
                    src="/logos.png"
                    alt="Nomadic Trails"
                    className="w-[105.89px] h-[41.026px] object-contain hover:scale-105 transition-transform duration-300"
                  />
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100/50 rounded-full transition-all duration-300 group"
                onClick={() => navigate('/login')}
              >
                <UserPlus className="h-5 w-5 group-hover:text-[#C66E4E] group-hover:scale-110 transition-all duration-300" />
                <span className="group-hover:text-[#C66E4E] transition-colors duration-300">Sign In / Sign Up</span>
              </Button>

              <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100/50 rounded-full cursor-pointer transition-all duration-300 group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    G
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#C66E4E] transition-colors duration-300">
                    Guest User
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col h-full pt-16">
          {/* Banner Section */}
          <div className="w-full px-4 py-6">
            <div className="bg-[#C66E4F] rounded-lg overflow-hidden w-full max-w-4xl mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Made for Those<br />
                    Allergic to Cubicles
                  </h1>
                  <div className="space-y-1 text-white/80 text-sm mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <p>Handpicked stays • Nomad-friendly cities</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <p>Visa tips • Travel deals • AI-powered destination picks</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col mt-6 md:mt-0 md:items-end justify-center gap-2">
                  <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1 rounded-full text-sm">
                    <span className="h-2 w-2 bg-green-400 rounded-full"></span>
                    <span>Work Remotely</span>
                  </div>
                  <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1 rounded-full text-sm">
                    <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                    <span>Travel Smart</span>
                  </div>
                  <div className="flex items-center gap-2 text-white bg-white/10 px-3 py-1 rounded-full text-sm">
                    <span className="h-2 w-2 bg-purple-400 rounded-full"></span>
                    <span>Live Freely</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col justify-center items-center px-4">
            {!messages.length ? (
              <div className="flex flex-col items-center justify-center text-center max-w-md">
                <div className="w-[60px] h-[60px] rounded-full bg-white border border-gray-200 overflow-hidden mb-6">
                  <img 
                    src="/AI Avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2">Hello Guest!</h2>
                <p className="text-gray-500 mb-8">
                  Discover destinations made just for you.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-3xl mx-auto py-4 space-y-6 overflow-y-auto flex-1">
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
                        "max-w-3xl rounded-2xl p-4",
                        message.role === 'user' 
                          ? 'bg-[#C66E4F] text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                      )}
                    >
                      <div className="prose prose-sm max-w-none">
                        {message.content}
                      </div>
                      
                      {/* For AI messages with destinations, render destination cards */}
                      {message.isTravel && message.destinations && message.destinations.length > 0 && (
                        <div className="mt-6">
                          <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Suggested Destinations for You</h2>
                            <p className="text-sm text-gray-600">Personalized recommendations based on your preferences.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {message.destinations.map((destination: any) => (
                              <div key={destination.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                <div className="h-32 bg-gray-200 relative">
                                  {destination.imageUrl && (
                                    <img 
                                      src={destination.imageUrl} 
                                      alt={destination.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="p-3">
                                  <h3 className="font-medium text-gray-900">{destination.name}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <span>{destination.description?.substring(0, 50)}...</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 ml-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C66E4F] to-[#E88B6D] flex items-center justify-center text-white font-medium shadow-sm">
                          G
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="flex items-center p-4 border-t border-gray-200 bg-white">
            <div className="flex w-full max-w-3xl mx-auto relative">
              <button
                type="button"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <Plus className="h-5 w-5" />
              </button>
              
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Message Wanderlust Whisper..."
                className="flex-1 bg-white border border-gray-200 rounded-full pl-10 pr-14 py-6 focus:ring-1 focus:ring-[#C66E4F] focus:border-[#C66E4F]"
                disabled={isTyping}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-[#C66E4F] text-white",
                  (!inputValue.trim() || isTyping) && "opacity-50"
                )}
              >
                {isTyping ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="transform rotate-90">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestWelcome;