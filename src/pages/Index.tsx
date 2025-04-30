
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import DestinationDeck from '../components/DestinationDeck';
import { mockDestinations } from '../data/mockDestinations';

interface Message {
  text: string;
  isUser: boolean;
}

const WELCOME_MESSAGE = "Hi there! 👋 I'm your Nomadic Concierge. Looking for your next digital nomad destination? Ask me about places with affordable living, great WiFi, or specific regions you're interested in!";

const Index: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: WELCOME_MESSAGE, isUser: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sample AI responses based on keywords
  const getAIResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('beach') && 
        (lowercaseMessage.includes('cheap') || lowercaseMessage.includes('affordable'))) {
      return "You might love Da Nang, Vietnam or Lagos, Portugal! Da Nang offers amazing WiFi cafés, super affordable living, and a vibrant nomad community. Lagos has a relaxed European vibe, solid WiFi spots, and beautiful coastal walks. Would you prefer Southeast Asia or Europe?";
    } 
    
    if (lowercaseMessage.includes('wifi') && lowercaseMessage.includes('asia')) {
      return "For great WiFi in Asia, Taipei (Taiwan) and Seoul (South Korea) are exceptional with some of the fastest internet speeds globally. Chiang Mai (Thailand) and Kuala Lumpur (Malaysia) offer reliable connections at more affordable prices. Da Nang (Vietnam) has solid fiber options in cafes and coworking spaces. Which sounds most interesting to you?";
    }
    
    if (lowercaseMessage.includes('safety') || lowercaseMessage.includes('safe')) {
      return "Safety-wise, Lisbon (Portugal), Tokyo (Japan), and Singapore consistently rank high for digital nomads. Ljubljana (Slovenia) is a hidden gem with extremely low crime rates. Taipei (Taiwan) combines safety with affordability. Would you like more details about any of these places?";
    }
    
    if (lowercaseMessage.includes('cheap') || lowercaseMessage.includes('affordable')) {
      return "For budget-friendly nomad living, check out Chiang Mai (Thailand) for $800-1200/month all-in, Da Nang (Vietnam) at $700-1100/month, or Tbilisi (Georgia) around $900-1300/month. Medellín (Colombia) is fantastic value in Latin America. All offer good WiFi and strong nomad communities. Do any of these regions interest you?";
    }
    
    // Default response
    return "Based on what you're looking for, you might enjoy destinations like Da Nang (Vietnam), Lagos (Portugal), Canggu (Indonesia), or Medellín (Colombia). Each offers unique advantages for digital nomads - from affordable living costs and reliable WiFi to vibrant communities. Would you like specific details about any of these places?";
  };

  const handleSendMessage = (message: string) => {
    // Add user message
    const newUserMessage = { text: message, isUser: true };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Start loading state
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Get AI response
      const aiResponse = getAIResponse(message);
      const newAiMessage = { text: aiResponse, isUser: false };
      
      // Add AI message
      setMessages(prev => [...prev, newAiMessage]);
      setIsLoading(false);
      
      // Show destination cards after AI responds
      setShowDestinations(true);
    }, 1500);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-40 h-40 bg-nomad-blue/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-10 right-10 w-60 h-60 bg-nomad-orange/10 rounded-full blur-3xl -z-10"></div>
      
      <main className="pt-24 pb-16 px-4 container mx-auto max-w-4xl">
        {/* Hero section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your Personal Digital Nomad Concierge
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find your perfect nomad destination with personalized recommendations for 
            WiFi quality, cost of living, visa options, and local tips.
          </p>
        </div>
        
        {/* Chat section */}
        <div className="bg-gray-100/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
          <div 
            ref={chatContainerRef}
            className="mb-4 max-h-[400px] overflow-y-auto scroll-smooth py-2"
          >
            {messages.map((msg, index) => (
              <ChatMessage 
                key={index} 
                message={msg.text} 
                isUser={msg.isUser} 
                animationDelay={100 * index}
              />
            ))}
            {isLoading && (
              <div className="flex space-x-2 px-4 py-3 max-w-[70%] animate-pulse">
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>
          
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
        
        {/* Destination cards */}
        <DestinationDeck 
          destinations={mockDestinations} 
          isVisible={showDestinations} 
        />
        
        {/* Suggestions for first-time users */}
        {!showDestinations && (
          <div className="mt-12 animate-fade-in-slow">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Try asking about:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Affordable beach cities with good WiFi",
                "Safe destinations for solo female travelers",
                "Places with digital nomad visas",
                "Cities with the best coworking spaces",
                "Where to go in Southeast Asia for nomads",
                "Destinations with low cost of living in Europe"
              ].map((suggestion, i) => (
                <div 
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-nomad-blue/30 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-gray-100 bg-white mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2025 Nomadic Trails — Your personal nomad concierge</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
