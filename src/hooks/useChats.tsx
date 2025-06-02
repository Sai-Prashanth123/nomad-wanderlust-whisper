import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp 
} from '@/lib/firebase';
import { ChatSession, Destination } from '@/components/Layout';
import { Message } from '@/components/ChatUI';
import { v4 as uuidv4 } from 'uuid';

export const useChats = () => {
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewChatActive, setIsNewChatActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser, isGuestUser } = useAuth();

  // Load chats when user changes
  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser) {
        setChatSessions([]);
        setActiveChatId(null);
        setLoading(false);
        return;
      }

      try {
        if (isGuestUser) {
          // For guest users, initialize with empty chats array
          // These will only exist in memory
          setChatSessions([]);
        } else {
          // Load chats from Firebase for authenticated users
        setLoading(true);
        console.log(`Loading chats for user ${currentUser.uid}`);
        
        // Create the user document if it doesn't exist
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log('User document does not exist, creating it');
          await setDoc(userDocRef, {
            email: currentUser.email,
            createdAt: new Date(),
            lastLogin: new Date()
          });
        } else {
          // Update last login time
          await updateDoc(userDocRef, {
            lastLogin: new Date()
          });
        }
        
        // Get user's chats
        const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
        const q = query(chatsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadedChats: ChatSession[] = [];
        
        querySnapshot.forEach((doc) => {
          try {
            const chatData = doc.data();
            // Ensure the messages are properly formatted
            const messages = (chatData.messages || []).map((msg: any) => ({
              id: msg.id || uuidv4(),
              content: msg.content || '',
              role: msg.role || 'assistant',
              timestamp: msg.timestamp?.toDate() || new Date(),
              isTravel: msg.isTravel || false,
              destinations: msg.destinations || []
            }));
            
            // Handle destinations if present
            const destinations = chatData.destinations || [];
            
            loadedChats.push({
              id: doc.id,
              title: chatData.title || 'New chat',
              timestamp: chatData.timestamp?.toDate() || new Date(),
              messages: messages,
              lastMessage: chatData.lastMessage || undefined,
              destinations: destinations
            });
          } catch (docError) {
            console.error(`Error processing chat document ${doc.id}:`, docError);
          }
        });

        console.log(`Loaded ${loadedChats.length} chats`);
        setChatSessions(loadedChats);
        
        // Set active chat to the most recent one if it exists
        if (loadedChats.length > 0) {
          setActiveChatId(loadedChats[0].id);
          setIsNewChatActive(false);
        } else {
          setActiveChatId(null);
          setIsNewChatActive(true);
          }
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        // On error, set empty state
        setChatSessions([]);
        setActiveChatId(null);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [currentUser, isGuestUser]);

  // Handle chat selection
  const handleChatSelect = (chatId: string | null) => {
    if (chatId) {
      setActiveChatId(chatId);
      setIsNewChatActive(false);
      
      // Log destinations for the selected chat
      const selectedChat = chatSessions.find(chat => chat.id === chatId);
      console.log(`Switched to chat ${chatId} with ${selectedChat?.destinations?.length || 0} destinations`);
      
      // Mark this chat as read (clear unread status if implemented)
      // markChatAsRead(chatId);
    } else {
      // If null is passed, create a new chat
      createNewChat();
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date(),
      messages: [],
      destinations: []
    };

    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setIsNewChatActive(true);

    if (currentUser && !isGuestUser) {
      // Save to Firebase only for non-guest users
    try {
      console.log(`Creating new chat ${newChatId} for user ${currentUser.uid}`);
      const chatRef = doc(db, 'users', currentUser.uid, 'chats', newChatId);
      
      // Create the initial chat document
      const newChatData = {
        title: newChat.title,
        timestamp: new Date(), // Use regular Date for initial creation
        messages: [],
        lastMessage: null,
        userId: currentUser.uid,
        createdAt: new Date(),
        destinations: []
      };
      
      await setDoc(chatRef, newChatData);
      console.log('New chat created successfully:', newChatId);
    } catch (error) {
      console.error('Error creating new chat:', error);
      
      // If there was an error, remove from local state
      setChatSessions(prev => prev.filter(chat => chat.id !== newChatId));
      
      // Set a different active chat if available
      if (chatSessions.length > 0) {
        setActiveChatId(chatSessions[0].id);
        setIsNewChatActive(false);
      } else {
        setActiveChatId(null);
      }
      }
    }

    return newChatId;
  };

  // Update chat messages
  const updateChatMessages = async (chatId: string, messages: Message[]) => {
    setChatSessions(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            messages,
            title: messages[0]?.content.slice(0, 30) || 'New Chat',
            lastMessage: messages[messages.length - 1]?.content
          };
          
          if (currentUser && !isGuestUser) {
            // Update Firebase for non-guest users
            try {
              const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
              
              // Format messages for Firebase, removing undefined values
              const formattedMessages = messages.map(msg => ({
                id: msg.id || uuidv4(),
                content: msg.content || '',
                role: msg.role || 'user',
                timestamp: msg.timestamp || new Date(),
                isTravel: msg.isTravel || false,
                destinations: msg.destinations || [],
                hasDestinations: msg.hasDestinations || false
              }));

              // Create a clean object for Firebase
              const chatData = {
                title: updatedChat.title || 'New Chat',
                messages: formattedMessages,
                lastMessage: messages[messages.length - 1]?.content || '',
                timestamp: new Date(),
                userId: currentUser.uid,
                destinations: updatedChat.destinations || [],
                updatedAt: new Date()
              };

              // Remove any remaining undefined values
              Object.keys(chatData).forEach(key => {
                if (chatData[key] === undefined) {
                  delete chatData[key];
                }
              });

              setDoc(chatRef, chatData, { merge: true });
            } catch (error) {
              console.error('Error updating chat in Firebase:', error);
            }
          }
          
          return updatedChat;
        }
        return chat;
      });
      return updated;
    });
  };

  // Update chat destinations
  const updateChatDestinations = async (chatId: string, destinations: Destination[]) => {
    setChatSessions(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = { ...chat, destinations };
          
          if (currentUser && !isGuestUser) {
            // Update Firebase for non-guest users
            try {
              const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
              updateDoc(chatRef, {
                destinations: destinations,
                updatedAt: new Date()
              });
            } catch (error) {
              console.error('Error updating destinations in Firebase:', error);
            }
          }
          
          return updatedChat;
        }
        return chat;
      });
      return updated;
    });
  };

  // Rename chat session
  const renameChatSession = async (chatId: string, newTitle: string) => {
    setChatSessions(prev => {
      const updated = prev.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = { ...chat, title: newTitle };
          
          if (!isGuestUser) {
            // Update Firebase only for non-guest users
            // ... existing Firebase update code ...
          }
          
          return updatedChat;
        }
        return chat;
      });
      return updated;
    });
  };

  // Delete chat session
  const deleteChatSession = async (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setIsNewChatActive(false);
    }

    if (currentUser && !isGuestUser) {
      // Delete from Firebase only for non-guest users
      // ... existing Firebase delete code ...
    }
  };

  return {
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
  };
}; 