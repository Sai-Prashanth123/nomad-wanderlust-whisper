import React, { useState } from 'react';
import { 
  Search, 
  Lightbulb, 
  BookOpen, 
  Image, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Index: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="max-w-5xl mx-auto">
      {/* Main welcome section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          What can I help with?
        </h1>
        <p className="text-lg text-white/80 mb-8">
          Your personal assistant for finding the perfect nomadic destination
        </p>
        
        {/* Large search input */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Input
            className="w-full px-5 py-6 text-lg bg-black/20 border-gray-700 rounded-xl text-white placeholder:text-gray-400"
            placeholder="Ask about nomadic destinations, visa requirements, or travel tips..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 rounded-lg p-2" 
            size="icon"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Try asking about</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "Best destinations for digital nomads with fast internet",
            "Affordable beach cities with vibrant nomad communities",
            "Countries with digital nomad visas in 2024",
            "Best places to work remotely in South East Asia",
            "Cost of living comparison between Lisbon and Bali",
            "Weather patterns in Medellín throughout the year"
          ].map((suggestion, i) => (
            <Card 
              key={i}
              className="p-4 bg-black/40 border-gray-800 hover:border-primary/50 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm"
              onClick={() => setQuery(suggestion)}
            >
              <p className="text-white">{suggestion}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick actions section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 flex flex-col items-center bg-black/40 border-gray-800 hover:border-primary/50 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm">
            <Search className="h-8 w-8 mb-3 text-primary" />
            <span className="text-white">Search Destinations</span>
          </Card>
          
          <Card className="p-6 flex flex-col items-center bg-black/40 border-gray-800 hover:border-primary/50 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm">
            <Image className="h-8 w-8 mb-3 text-secondary" />
            <span className="text-white">Generate Images</span>
          </Card>
          
          <Card className="p-6 flex flex-col items-center bg-black/40 border-gray-800 hover:border-primary/50 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm">
            <Lightbulb className="h-8 w-8 mb-3 text-accent" />
            <span className="text-white">Travel Insights</span>
          </Card>
          
          <Card className="p-6 flex flex-col items-center bg-black/40 border-gray-800 hover:border-primary/50 hover:bg-black/60 transition-all cursor-pointer backdrop-blur-sm">
            <BookOpen className="h-8 w-8 mb-3 text-primary" />
            <span className="text-white">Travel Guides</span>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
