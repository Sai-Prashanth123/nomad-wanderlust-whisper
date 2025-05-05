import React, { useRef } from 'react';
import DestinationCard, { Destination } from './DestinationCard';

interface DestinationDeckProps {
  destinations: Destination[];
  isVisible: boolean;
}

const DestinationDeck: React.FC<DestinationDeckProps> = ({ destinations, isVisible }) => {
  const deckRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the deck when destinations are shown
  React.useEffect(() => {
    if (isVisible && destinations.length > 0 && deckRef.current) {
      setTimeout(() => {
        deckRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [isVisible, destinations.length]);

  if (!isVisible || destinations.length === 0) {
    return null;
  }

  return (
    <div 
      ref={deckRef}
      className="mt-6 space-y-3 animate-fade-in"
    >
      <h2 className="text-xl font-bold text-gray-800">Recommended Destinations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination, index) => (
          <DestinationCard 
            key={`${destination.name}-${index}`}
            destination={destination}
          />
        ))}
      </div>
    </div>
  );
};

export default DestinationDeck;
