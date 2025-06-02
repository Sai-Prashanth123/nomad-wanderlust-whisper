import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Keep backward compatibility
export type ChatItem = ChatSession;

interface ChatListProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onArchiveChat: (chatId: string) => void;
  sidebarOpen: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onChatSelect,
  onDeleteChat,
  onRenameChat,
  onArchiveChat,
  sidebarOpen
}) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = React.useState({ top: false, bottom: false });
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  
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
  }, [chats, sidebarOpen]);

  const scrollTo = (direction: 'top' | 'bottom') => {
    if (listRef.current) {
      const scrollAmount = direction === 'top' ? 0 : listRef.current.scrollHeight;
      listRef.current.scrollTo({
        top: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const handleEditClick = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleEditSave = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle);
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
    }
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  const renderChatGroup = (chatGroup: ChatSession[]) => {
    if (chatGroup.length === 0) return null;
    
    return (
      <div className="space-y-2 animate-in slide-in-from-left duration-500">
        {chatGroup.map((chat, index) => (
            <div
              key={chat.id}
            onClick={() => onChatSelect(chat.id)}
              className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group",
              "hover:shadow-md hover:shadow-[#C66E4E]/5 hover:-translate-y-0.5",
                chat.id === activeChatId 
                ? "bg-[#FFF1EC] shadow-sm" 
                : "hover:bg-[#FFF1EC]/70 bg-white/40",
              "animate-in fade-in-50 slide-in-from-left-5",
              "data-[state=selected]:bg-[#FFF1EC]",
              "style-delay-${index * 100}"
            )}
            data-state={chat.id === activeChatId ? 'selected' : 'default'}
          >
            <div className="flex-1 min-w-0">
              {sidebarOpen && (
                <div className="truncate space-y-0.5">
                    {editingChatId === chat.id ? (
                    <div className="flex items-center space-x-2 bg-white/80 rounded-lg p-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-[#C66E4E] focus:ring-1 focus:ring-[#C66E4E]/30 transition-all duration-300"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSave(chat.id);
                          }}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-300"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCancel();
                          }}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                    <>
                      <div className={cn(
                        "font-medium truncate group-hover:text-[#C66E4E] transition-colors duration-300",
                        chat.id === activeChatId ? "text-[#C66E4E]" : "text-gray-700"
                      )}>
                        {chat.title}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-xs text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">
                          {chat.lastMessage}
                      </div>
                    )}
                    </>
                    )}
                  </div>
                )}
              </div>
              
            {sidebarOpen && (
              <div className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity duration-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500 hover:text-[#C66E4E] hover:bg-[#C66E4E]/10 rounded-lg transition-all duration-300"
                    >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg rounded-xl p-1 animate-in zoom-in-90 duration-300"
                  >
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(chat.id, chat.title);
                        }}
                      className="flex items-center px-3 py-2 hover:bg-[#FFF1EC] rounded-lg cursor-pointer transition-all duration-300 group"
                      >
                      <Pencil className="mr-2 h-4 w-4 group-hover:text-[#C66E4E] transition-colors duration-300" />
                      <span className="group-hover:text-[#C66E4E] transition-colors duration-300">Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(chat.id);
                        }}
                      className="flex items-center px-3 py-2 hover:bg-red-50 rounded-lg cursor-pointer transition-all duration-300 group"
                      >
                      <Trash className="mr-2 h-4 w-4 group-hover:text-red-600 transition-colors duration-300" />
                      <span className="group-hover:text-red-600 transition-colors duration-300">Delete</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveChat(chat.id);
                        }}
                      className="flex items-center px-3 py-2 hover:bg-[#FFF1EC] rounded-lg cursor-pointer transition-all duration-300 group"
                      >
                      <Archive className="mr-2 h-4 w-4 group-hover:text-[#C66E4E] transition-colors duration-300" />
                      <span className="group-hover:text-[#C66E4E] transition-colors duration-300">Archive</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <>
      <div className="relative h-full">
        <div 
          ref={listRef}
          className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#C66E4E]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#C66E4E]/30 transition-colors duration-300"
        >
          {renderChatGroup(chats)}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-lg border-gray-200/50 shadow-xl rounded-2xl animate-in zoom-in-90 duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Delete Chat</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              className="hover:bg-gray-100/80 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 transition-all duration-300"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatList; 