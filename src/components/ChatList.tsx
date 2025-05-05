import React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, MoreVertical, Pencil, Archive, Trash, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatSession } from './Layout';

// Keep backward compatibility
export type ChatItem = ChatSession;

interface ChatListProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onArchiveChat: (chatId: string) => void;
  isSidebarOpen: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onDeleteChat,
  onRenameChat,
  onArchiveChat,
  isSidebarOpen
}) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = React.useState({ top: false, bottom: false });
  
  React.useEffect(() => {
    const checkScroll = () => {
      if (listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        setShowScrollButtons({
          top: scrollTop > 20,
          bottom: scrollHeight - scrollTop - clientHeight > 20
        });
      }
    };
    
    // Check on mount and when chats change
    checkScroll();
    
    // Add scroll event listener
    const currentRef = listRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
    };
  }, [chats, isSidebarOpen]);

  const scrollTo = (direction: 'top' | 'bottom') => {
    if (listRef.current) {
      const scrollAmount = direction === 'top' ? 0 : listRef.current.scrollHeight;
      listRef.current.scrollTo({
        top: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // If there are no chats, show an empty state
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs p-4 text-center">
        <MessageSquare className="h-6 w-6 mb-2 opacity-50" />
        <p>No chats to display</p>
        <p className="mt-1">Start a new conversation</p>
      </div>
    );
  }
  
  // Group chats by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const todayChats = chats.filter(chat => chat.timestamp >= today);
  const yesterdayChats = chats.filter(chat => chat.timestamp >= yesterday && chat.timestamp < today);
  const lastWeekChats = chats.filter(chat => chat.timestamp >= lastWeek && chat.timestamp < yesterday);
  const olderChats = chats.filter(chat => chat.timestamp < lastWeek);

  const renderChatGroup = (chatGroup: ChatSession[], title?: string) => {
    if (chatGroup.length === 0) return null;
    
    return (
      <div className="mb-4">
        {title && isSidebarOpen && (
          <h3 className="text-xs font-medium text-gray-400 mb-2 px-2">{title}</h3>
        )}
        <div className="space-y-1">
          {chatGroup.map(chat => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center justify-between rounded-lg cursor-pointer",
                chat.id === activeChatId 
                  ? "bg-gray-800" 
                  : "hover:bg-gray-800",
                isSidebarOpen ? "px-3 py-2" : "px-2 py-2 justify-center"
              )}
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="flex items-center overflow-hidden">
                <MessageSquare 
                  className={cn(
                    "flex-shrink-0 h-5 w-5", 
                    chat.id === activeChatId ? "text-white" : "text-gray-400",
                    isSidebarOpen ? "mr-3" : ""
                  )}
                />
                {isSidebarOpen && (
                  <div className="truncate">
                    <div className={cn(
                      "font-medium truncate",
                      chat.id === activeChatId ? "text-white" : "text-gray-300"
                    )}>
                      {chat.title}
                    </div>
                    {chat.lastMessage && (
                      <div className="text-xs text-gray-400 truncate">{chat.lastMessage}</div>
                    )}
                  </div>
                )}
              </div>
              
              {isSidebarOpen && (
                <div className="opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800 text-white">
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newTitle = prompt('Rename chat', chat.title);
                          if (newTitle) onRenameChat(chat.id, newTitle);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveChat(chat.id);
                        }}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        <span>Archive</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-gray-800 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this chat?')) {
                            onDeleteChat(chat.id);
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Check if there are any groups to render
  const hasContent = todayChats.length > 0 || yesterdayChats.length > 0 || 
                    lastWeekChats.length > 0 || olderChats.length > 0;

  return (
    <div className="relative h-full flex flex-col">
      {/* Scroll up button */}
      {showScrollButtons.top && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full bg-gray-800/70 text-gray-400 hover:text-white"
            onClick={() => scrollTo('top')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent scrollbar-thumb-rounded-full pb-4 px-2"
      >
        {hasContent ? (
          <>
            {renderChatGroup(todayChats, "Today")}
            {renderChatGroup(yesterdayChats, "Yesterday")}
            {renderChatGroup(lastWeekChats, "Previous 7 Days")}
            {renderChatGroup(olderChats, "Older")}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-xs p-4 text-center">
            <Search className="h-5 w-5 mb-2 opacity-50" />
            <p>No matching chats found</p>
          </div>
        )}
      </div>
      
      {/* Scroll down button */}
      {showScrollButtons.bottom && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full bg-gray-800/70 text-gray-400 hover:text-white"
            onClick={() => scrollTo('bottom')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatList; 