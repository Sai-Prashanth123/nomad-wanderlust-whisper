import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import TravelPlanModal from './TravelPlanModal';

// Sample data for the travel plan
const sampleTravelPlanData = {
  destination: 'Sayaji Baug, Vadodara',
  dates: 'May 4 to May 7, 2025',
  overview: 'Welcome to Sayaji Baug, Vadodara\'s pride and one of India\'s most picturesque and well-maintained public gardens. Spreading across 113 acres, it is not only an oasis of greenery but also a treasure trove of culture, nature, and entertainment. Your luxury-packed trip will explore this enchanting destination in depth, blending immersive cultural experiences, nature exploration, gourmet dining, and vibrant evenings. Despite May being warmer (summer in India), you\'ll enjoy air-conditioned transfers and luxury amenities, ensuring comfort while you delve into this tropical paradise.',
  digitalNomadSetup: 'Vadodara offers a range of options for digital nomads seeking to combine work and exploration. With moderate internet speeds, various coworking spaces, and cozy coffee shops, you\'ll have no trouble staying connected while soaking in all the leisurely opportunities the city offers.',
  days: [
    {
      title: 'Day 1: Arrival & Garden Exploration',
      description: 'Begin your adventure with a comprehensive tour of the magnificent Sayaji Baug gardens.',
      activities: [
        'Morning visit to the main garden areas with guided botanical tour',
        'Afternoon exploration of the historical monuments within the garden',
        'Evening relaxation by the lakeside with traditional Gujarati refreshments'
      ]
    },
    {
      title: 'Day 2: Museum & Zoo Experience',
      description: 'Discover the cultural and wildlife treasures housed within Sayaji Baug.',
      activities: [
        'Visit to the Baroda Museum & Picture Gallery to admire its diverse collection',
        'Exploration of the Sayaji Baug Zoo to observe various species',
        'Afternoon picnic in the designated garden areas',
        'Evening planetarium show (if available)'
      ]
    },
    {
      title: 'Day 3: Leisure & Recreation',
      description: 'Enjoy the recreational facilities and hidden spots within the garden complex.',
      activities: [
        'Morning yoga session in the quiet sections of the garden',
        'Boat ride on the garden lake',
        'Visit to the Floral Clock and toy train ride',
        'Evening cultural performance or music event (if scheduled)'
      ]
    }
  ]
};

const TravelPlanExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Travel Plan Demo</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Click the button below to view an enhanced travel plan modal with beautiful animations and premium styling.
        </p>
        
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-6 rounded-xl font-medium"
        >
          View Travel Plan
        </Button>
      </div>
      
      <TravelPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        planData={sampleTravelPlanData} 
      />
    </div>
  );
};

export default TravelPlanExample; 