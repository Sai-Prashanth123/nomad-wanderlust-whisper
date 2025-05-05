import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Menu, 
  Search, 
  Plus,
  Library, 
  Settings, 
  ExternalLink,
  User,
  ChevronDown,
  X,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import ChatList from '@/components/ChatList';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './ChatUI';
import { useChats } from '@/hooks/useChats';
import { DestinationDetail } from './ResponseHandler';
import FavoritesDashboard from './FavoritesDashboard';

// Update Destination type to be an alias of DestinationDetail for compatibility
export type Destination = DestinationDetail;

// Create a context to share chat data across components
export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  lastMessage?: string;
  destinations?: Destination[];
}

interface ChatContextType {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  isNewChatActive: boolean;
  loading?: boolean;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => string | null;
  updateChatMessages: (chatId: string, messages: Message[]) => void;
  renameChatSession: (chatId: string, newTitle: string) => void;
  deleteChatSession: (chatId: string) => void;
  setIsNewChatActive: (isActive: boolean) => void;
  updateChatDestinations: (chatId: string, destinations: Destination[]) => void;
}

export const ChatContext = React.createContext<ChatContextType>({
  chatSessions: [],
  activeChatId: null,
  isNewChatActive: false,
  loading: false,
  setActiveChatId: () => {},
  createNewChat: () => "",
  updateChatMessages: () => {},
  renameChatSession: () => {},
  deleteChatSession: () => {},
  setIsNewChatActive: () => {},
  updateChatDestinations: () => {}
});

export const useChatContext = () => React.useContext(ChatContext);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [favoritesDashboardOpen, setFavoritesDashboardOpen] = useState(false);
  const { 
    chatSessions,
    activeChatId,
    isNewChatActive,
    loading,
    handleChatSelect,
    createNewChat,
    updateChatMessages,
    renameChatSession,
    deleteChatSession,
    setIsNewChatActive,
    updateChatDestinations
  } = useChats();
  
  const navigate = useNavigate();

  // Filter chats based on search term
  const filteredChats = searchTerm.trim() === '' 
    ? chatSessions 
    : chatSessions.filter(chat => 
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Default user name since we're not using auth
  const userName = 'Guest User';
  const userInitial = 'G';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChatSession(chatId);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    renameChatSession(chatId, newTitle);
  };

  const handleArchiveChat = (chatId: string) => {
    // Implement archive functionality
    console.log('Archive chat:', chatId);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Set up the chat context value
  const chatContextValue: ChatContextType = {
    chatSessions,
    activeChatId,
    isNewChatActive,
    loading,
    setActiveChatId: handleChatSelect,
    createNewChat,
    updateChatMessages,
    renameChatSession,
    deleteChatSession,
    setIsNewChatActive,
    updateChatDestinations
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#202020' }}>
        {/* Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 border-r border-gray-800",
            sidebarOpen ? "w-64 translate-x-0" : "w-16 translate-x-0"
          )}
          style={{ backgroundColor: '#141414' }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar header with toggle and search icon */}
            <div className="p-3 flex items-center justify-between border-b border-gray-800">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              {sidebarOpen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-white"
                  onClick={toggleSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Search bar */}
            {sidebarOpen && isSearching && (
              <div className="p-2 relative">
                <Input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg pr-8 w-full"
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* New chat button */}
            <div className="p-2">
              <Button 
                className={cn(
                  "bg-transparent hover:bg-gray-800 border border-gray-700 text-white w-full justify-start",
                  !sidebarOpen && "p-2 justify-center"
                )}
                onClick={handleNewChat}
              >
                <Plus className="h-4 w-4 mr-2" />
                {sidebarOpen && <span>New chat</span>}
              </Button>
            </div>

            {/* Chat history section */}
            <div className="flex-1 overflow-hidden flex flex-col h-[calc(100%-6rem)]">
              {loading ? (
                <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
                  Loading chats...
                </div>
              ) : searchTerm && filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm px-4 text-center">
                  <Search className="h-5 w-5 mb-2 opacity-50" />
                  <p>No chats found for "{searchTerm}"</p>
                </div>
              ) : (
                <ChatList 
                  chats={filteredChats}
                  activeChatId={activeChatId}
                  onChatSelect={handleChatSelect}
                  onDeleteChat={handleDeleteChat}
                  onRenameChat={handleRenameChat}
                  onArchiveChat={handleArchiveChat}
                  isSidebarOpen={sidebarOpen}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Top navigation bar with user profile */}
          <div className="border-b border-gray-800 backdrop-blur-md sticky top-0 z-40" style={{ backgroundColor: 'transparent' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              {/* Left side: App title and user profile */}
              <div className="flex flex-wrap items-center gap-4">
                {/* App title - now moved to the left */}
                <h1 className="text-xl font-bold app-title-gradient m-0 mr-2">
                  Wanderlust Whisper
                </h1>
              </div>
              
              {/* Center: Mobile sidebar toggle (only on mobile) */}
              <div className="md:hidden flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-white p-1 h-8 w-8"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Right side: User profile and Favorites */}
              <div className="flex items-center gap-3">
                {/* Favorites button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFavoritesDashboardOpen(true)}
                  className="text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700 py-1 px-3 h-auto flex items-center gap-1.5 rounded-full border border-gray-700"
                >
                  <Heart className="h-4 w-4 text-pink-500" fill="#ec4899" />
                  <span className="font-medium">Favorites</span>
                </Button>

                {/* User dropdown */}
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-700 flex items-center justify-center user-avatar">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="text-gray-300 text-sm hidden md:block">{userName}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content wrapper */}
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
      
      {/* Favorites Dashboard */}
      <FavoritesDashboard 
        isOpen={favoritesDashboardOpen}
        onClose={() => setFavoritesDashboardOpen(false)}
      />
    </ChatContext.Provider>
  );
};

export default Layout; 