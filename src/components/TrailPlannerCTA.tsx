import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Map } from 'lucide-react';
import { Destination } from './DestinationCard';
import { motion } from 'framer-motion';
import { TrailPlannerForm, ItineraryFormData } from './TrailPlannerForm';
import { GeneratedItinerary } from './GeneratedItinerary';

// Define the backend API URL
const API_URL = 'http://localhost:5000';

interface TrailPlannerCTAProps {
  destination: Destination;
}

export const TrailPlannerCTA: React.FC<TrailPlannerCTAProps> = ({ destination }) => {
  // Track the current view state
  const [viewState, setViewState] = useState<'cta' | 'form' | 'itinerary' | 'loading'>('cta');
  // Store form data once submitted
  const [formData, setFormData] = useState<ItineraryFormData | null>(null);
  // Store itinerary data
  const [itineraryData, setItineraryData] = useState<any>(null);
  // Store error state
  const [error, setError] = useState<string | null>(null);

  // Handle clicking the "Start Planning" button
  const handleStartPlanning = () => {
    setViewState('form');
  };
  
  // Handle form submission
  const handleFormSubmit = async (data: ItineraryFormData) => {
    setFormData(data);
    setViewState('loading');
    
    try {
      // Call the backend API to generate itinerary
      const response = await fetch(`${API_URL}/api/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          formData: data,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }
      
      const itinerary = await response.json();
      setItineraryData(itinerary);
      setViewState('itinerary');
      
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError('Failed to generate your itinerary. Please try again later.');
      setViewState('form');
    }
  };
  
  // Handle going back from itinerary to form
  const handleBackToForm = () => {
    setViewState('form');
  };
  
  // Handle canceling from form back to CTA
  const handleCancelForm = () => {
    setViewState('cta');
  };

  // Render the appropriate view based on state
  if (viewState === 'form') {
    return (
      <TrailPlannerForm 
        destination={destination} 
        onSubmit={handleFormSubmit}
        onClose={handleCancelForm}
      />
    );
  }

  if (viewState === 'loading') {
    return (
      <motion.div 
        className="bg-black/80 rounded-lg border border-gray-800 p-6 max-w-3xl mx-auto flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ minHeight: '300px' }}
      >
        <div className="flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-purple-600 rounded-full animate-bounce"></div>
          <div className="h-3 w-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-3 w-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-white text-lg">Creating your personalized itinerary...</p>
        <p className="text-gray-400 text-sm mt-2">This might take a moment as we craft the perfect plan for you</p>
      </motion.div>
    );
  }

  if (viewState === 'itinerary' && formData && itineraryData) {
    return (
      <GeneratedItinerary
        destination={destination}
        formData={formData}
        onBack={handleBackToForm}
        itineraryData={itineraryData}
      />
    );
  }

  // Default CTA view
  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-800/40 to-indigo-900/40 rounded-lg p-5 border border-purple-500/30 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-lg mb-2">Plan Your Nomad Trail</h3>
          <p className="text-gray-300 text-sm">
            Ready to explore {destination.name}? Create a personalized travel itinerary with our AI assistant.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex items-center text-xs bg-black/30 rounded-full px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-purple-400 mr-1.5" />
              <span>Suggested stay: 1-3 months</span>
            </div>
            <div className="flex items-center text-xs bg-black/30 rounded-full px-3 py-1.5">
              <Map className="h-3.5 w-3.5 text-blue-400 mr-1.5" />
              <span>Local expertise included</span>
            </div>
          </div>
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full px-4 group"
          onClick={handleStartPlanning}
        >
          Start Planning
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}; 