import React, { useRef, useEffect } from 'react';
import DestinationCard, { Destination } from './DestinationCard';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface DestinationCardDeckProps {
  destinations: Destination[];
}

const DestinationCardDeck: React.FC<DestinationCardDeckProps> = ({ destinations }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  // Scroll to this component when it mounts
  useEffect(() => {
    if (deckRef.current) {
      deckRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for individual cards
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div ref={deckRef}>
      <motion.div
        className="relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Suggested Destinations for You</h2>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => scroll('left')}
              className="h-8 w-8 rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => scroll('right')}
              className="h-8 w-8 rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-4">
            {destinations.map((destination, index) => (
              <motion.div 
                key={destination.id} 
                className="flex-shrink-0 w-72"
                variants={itemVariants}
              >
                <DestinationCard destination={destination} />
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Visual scroll indicator */}
        <div className="flex justify-center space-x-1 mt-2">
          {destinations.map((_, index) => (
            <div 
              key={index} 
              className={`h-1 rounded-full ${index === 0 ? 'w-6 bg-purple-500' : 'w-2 bg-gray-700'}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DestinationCardDeck; 