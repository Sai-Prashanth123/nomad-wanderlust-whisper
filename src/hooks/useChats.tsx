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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewChatActive, setIsNewChatActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load user's chat sessions from Firestore when user logs in
  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser) {
        setChatSessions([]);
        setActiveChatId(null);
        setLoading(false);
        return;
      }

      try {
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
  }, [currentUser]);

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
    if (!currentUser) return null;
    
    const newChatId = uuidv4();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New chat',
      timestamp: new Date(),
      messages: [],
      destinations: []
    };

    // Add to local state immediately for UI responsiveness
    setChatSessions([newChat, ...chatSessions]);
    setActiveChatId(newChatId);
    setIsNewChatActive(true);

    // Add to Firestore
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
      
      return newChatId;
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
      
      return null;
    }
  };

  // Update chat messages
  const updateChatMessages = async (chatId: string, messages: Message[]) => {
    if (!currentUser) return;

    // Update local state first for UI responsiveness
    setChatSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === chatId) {
          // Get the last message content for sidebar display
          const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : undefined;
          
          // Update chat title if it's still "New chat" and there's a user message
          let updatedTitle = session.title;
          if (updatedTitle === 'New chat' && messages.length >= 1) {
            // Use the first user message as the title, truncate if needed
            const firstUserMsg = messages.find(m => m.role === 'user')?.content;
            if (firstUserMsg) {
              updatedTitle = firstUserMsg.length > 30 
                ? firstUserMsg.substring(0, 30) + '...' 
                : firstUserMsg;
            }
          }
          
          return {
            ...session,
            messages,
            lastMessage: lastMsg,
            title: updatedTitle,
            timestamp: new Date() // Update timestamp to current
          };
        }
        return session;
      });
    });

    // Update in Firestore
    try {
      const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
      
      // Get current chat to check if title needs updating
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        console.log('Chat does not exist, creating it first');
        // Create the chat if it doesn't exist
        await setDoc(chatRef, {
          title: 'New chat',
          timestamp: serverTimestamp(),
          messages: [],
          lastMessage: null,
          userId: currentUser.uid,
          destinations: []
        });
      }
      
      const chatData = chatDoc.data();
      
      let updatedTitle = chatData?.title || 'New chat';
      if (updatedTitle === 'New chat' && messages.length >= 1) {
        const firstUserMsg = messages.find(m => m.role === 'user')?.content;
        if (firstUserMsg) {
          updatedTitle = firstUserMsg.length > 30 
            ? firstUserMsg.substring(0, 30) + '...' 
            : firstUserMsg;
        }
      }
      
      const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : undefined;
      
      // Properly serialize the messages for Firestore
      const serializedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        isTravel: msg.isTravel || false,
        destinations: msg.destinations || []
      }));
      
      // Use a simpler structure for Firestore to avoid potential issues
      const updateData = {
        messages: serializedMessages,
        lastMessage: lastMsg || null,
        title: updatedTitle,
        timestamp: serverTimestamp(),
        updatedAt: new Date(), // Fallback in case serverTimestamp fails
        // Also update the chat-level destinations from the last message with destinations
        destinations: messages.find(m => m.isTravel && m.destinations?.length > 0)?.destinations || []
      };
      
      await updateDoc(chatRef, updateData);
      console.log('Chat updated successfully:', chatId);
    } catch (error) {
      console.error('Error updating chat messages:', error);
      
      // Try to recreate the chat if there was an error
      try {
        const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
        
        // Properly serialize the messages for Firestore
        const serializedMessages = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          isTravel: msg.isTravel || false,
          destinations: msg.destinations || []
        }));
        
        // Get the title
        const firstUserMsg = messages.find(m => m.role === 'user')?.content;
        const title = firstUserMsg && firstUserMsg.length > 0 
          ? (firstUserMsg.length > 30 ? firstUserMsg.substring(0, 30) + '...' : firstUserMsg)
          : 'New chat';
        
        const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : null;
        
        // Set the entire document from scratch
        await setDoc(chatRef, {
          title: title,
          timestamp: new Date(),
          messages: serializedMessages,
          lastMessage: lastMsg,
          userId: currentUser.uid,
          createdAt: new Date(),
          destinations: []  // Keep existing destinations or set to empty array
        });
        console.log('Chat recreated successfully after error:', chatId);
      } catch (retryError) {
        console.error('Failed to recreate chat after error:', retryError);
      }
    }
  };

  // Update chat destinations
  const updateChatDestinations = async (chatId: string, destinations: Destination[]) => {
    if (!currentUser || !chatId) return;

    // Update local state first for UI responsiveness
    setChatSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === chatId) {
          return {
            ...session,
            destinations
          };
        }
        return session;
      });
    });

    // Update in Firestore
    try {
      console.log(`Updating destinations for chat ${chatId}`);
      const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
      
      // Get current chat to check if it exists
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        console.error('Cannot update destinations: Chat does not exist');
        return;
      }
      
      // Update only the destinations field
      await updateDoc(chatRef, {
        destinations,
        updatedAt: new Date()
      });
      
      console.log('Chat destinations updated successfully:', destinations.length);
    } catch (error) {
      console.error('Error updating chat destinations:', error);
    }
  };

  // Rename chat session
  const renameChatSession = async (chatId: string, newTitle: string) => {
    if (!currentUser) return;

    // Update local state
    setChatSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === chatId ? { ...session, title: newTitle } : session
      )
    );

    // Update in Firestore
    try {
      const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
      await updateDoc(chatRef, {
        title: newTitle
      });
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  // Delete chat session
  const deleteChatSession = async (chatId: string) => {
    if (!currentUser) return;

    // Update local state
    setChatSessions(prevSessions => prevSessions.filter(session => session.id !== chatId));
    
    if (activeChatId === chatId) {
      const remainingSessions = chatSessions.filter(session => session.id !== chatId);
      setActiveChatId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      setIsNewChatActive(remainingSessions.length === 0);
    }

    // Delete from Firestore
    try {
      const chatRef = doc(db, 'users', currentUser.uid, 'chats', chatId);
      await deleteDoc(chatRef);
    } catch (error) {
      console.error('Error deleting chat:', error);
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