import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Menu,
  Search,
  Plus,
  Library,
  Settings,
  LogOut,
  ExternalLink,
  User,
  ChevronDown,
  X,
  Heart,
  MessageSquare
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
  createNewChat: () => Promise<string | null>;
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
  setActiveChatId: () => { },
  createNewChat: async () => null,
  updateChatMessages: () => { },
  renameChatSession: () => { },
  deleteChatSession: () => { },
  setIsNewChatActive: () => { },
  updateChatDestinations: () => { }
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

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Filter chats based on search term
  const filteredChats = searchTerm.trim() === ''
    ? chatSessions
    : chatSessions.filter(chat =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Get user's name from email (take everything before @)
  const userName = currentUser?.email
    ? currentUser.email.split('@')[0].split('.').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ')
    : 'User';

  // Get first character for avatar
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

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
      <img 
        src="/logos.png" 
        alt="Nomadic Trails" 
        className="w-[100px] h-[48px] object-contain hover:scale-105 transition-transform duration-300" 
      />
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


          {/* Chat List with enhanced scrollbar and animations */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#C66E4E]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#C66E4E]/30 transition-colors duration-300">
            {/* Today Section */}
            {(() => {
              const todayChats = filteredChats.filter(chat => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const chatDate = new Date(chat.timestamp);
                chatDate.setHours(0, 0, 0, 0);
                return chatDate.getTime() === today.getTime();
              });

              return todayChats.length > 0 && (
                <>
                  {sidebarOpen && <div className="px-3 pt-2 pb-1 text-xs font-medium text-gray-500 uppercase">Today</div>}
                  <div className="px-2">
                    <ChatList
                      chats={todayChats}
                      activeChatId={activeChatId}
                      onChatSelect={handleChatSelect}
                      onDeleteChat={handleDeleteChat}
                      onRenameChat={handleRenameChat}
                      onArchiveChat={handleArchiveChat}
                      sidebarOpen={sidebarOpen}
                    />
                  </div>
                </>
              );
            })()}

            {/* Yesterday Section */}
            {(() => {
              const yesterdayChats = filteredChats.filter(chat => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const chatDate = new Date(chat.timestamp);
                chatDate.setHours(0, 0, 0, 0);
                return chatDate.getTime() === yesterday.getTime();
              });

              return yesterdayChats.length > 0 && (
                <>
                  {sidebarOpen && <div className="px-3 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase">Yesterday</div>}
                  <div className="px-2">
                    <ChatList
                      chats={yesterdayChats}
                      activeChatId={activeChatId}
                      onChatSelect={handleChatSelect}
                      onDeleteChat={handleDeleteChat}
                      onRenameChat={handleRenameChat}
                      onArchiveChat={handleArchiveChat}
                      sidebarOpen={sidebarOpen}
                    />
                  </div>
                </>
              );
            })()}

            {/* Previous 7days Section */}
            {(() => {
              const previousChats = filteredChats.filter(chat => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(23, 59, 59, 999);
                const chatDate = new Date(chat.timestamp);
                return chatDate >= sevenDaysAgo && chatDate <= yesterday;
              });

              return previousChats.length > 0 && (
                <>
                  {sidebarOpen && <div className="px-3 pt-3 pb-1 text-xs font-medium text-gray-500 uppercase">Previous 7days</div>}
                  <div className="px-2">
                    <ChatList
                      chats={previousChats}
                      activeChatId={activeChatId}
                      onChatSelect={handleChatSelect}
                      onDeleteChat={handleDeleteChat}
                      onRenameChat={handleRenameChat}
                      onArchiveChat={handleArchiveChat}
                      sidebarOpen={sidebarOpen}
                    />
                  </div>
                </>
              );
            })()}

            {/* Show empty state only if no chats at all */}
            {filteredChats.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-600">No chats to display</p>
                <p className="text-xs text-gray-500 mt-1">Start a new conversation</p>
              </div>
            )}
          </div>

          {/* Search Bar with glass effect */}
          <div className="p-4 border-t border-gray-200/50 bg-white/70 backdrop-blur-md">
  <div className="relative group">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-[14.712px] w-[14.712px] text-black/60 transition-colors duration-300" />
    <Input
      type="text"
      placeholder="Search Your History..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-[200px] h-[38px] flex-shrink-0 pl-9 pr-4 bg-white/50 backdrop-blur-sm border border-black rounded-md transition-all duration-300 hover:bg-white/70"
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
            className={`fixed top-0 z-50 h-16 bg-white/50 shadow-md transition-all duration-300 ${
              sidebarOpen ? 'left-64 w-[calc(100%-16rem)]' : 'left-0 w-full'
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
                  onClick={() => setFavoritesDashboardOpen(true)}
                >
                  <Heart className="h-5 w-5 group-hover:text-[#C66E4E] group-hover:scale-110 transition-all duration-300" />
                  <span className="group-hover:text-[#C66E4E] transition-colors duration-300">Favorites</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100/50 rounded-full cursor-pointer transition-all duration-300 group">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C66E4E] to-[#E88B6D] flex items-center justify-center text-white font-medium shadow-lg transform group-hover:scale-105 transition-all duration-300">
                          {userInitial}
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#C66E4E] transition-colors duration-300">
                          {userName}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-[#C66E4E] transition-colors duration-300" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-lg rounded-xl p-1 animate-in zoom-in-90 duration-300"
                  >
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 hover:bg-red-50 rounded-lg cursor-pointer transition-all duration-300 group"
                    >
                      <LogOut className="mr-2 h-4 w-4 group-hover:text-red-600 transition-colors duration-300" />
                      <span className="group-hover:text-red-600 transition-colors duration-300">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {children}
        </main>
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