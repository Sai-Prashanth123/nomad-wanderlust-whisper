import React from 'react';
import { DestinationDetail } from './ResponseHandler';

interface DestinationDeckProps {
  destinations: DestinationDetail[];
  onViewDetails?: (destination: DestinationDetail) => void;
  onStartPlanning?: (destination: DestinationDetail) => void;
}

export const DestinationDeck: React.FC<DestinationDeckProps> = ({
  destinations,
  onViewDetails,
  onStartPlanning,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map((destination) => (
        <div
          key={destination.id}
          className="bg-gray-800/60 rounded-lg overflow-hidden hover:bg-gray-800/80 transition-all group"
        >
          <div className="relative h-48">
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-xl font-bold text-white">{destination.name}</h3>
              <p className="text-gray-300">{destination.country}</p>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-gray-300 text-sm line-clamp-3 mb-4">
              {destination.description}
            </p>
            
            <div className="flex justify-between">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(destination)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View Details
                </button>
              )}
              {onStartPlanning && (
                <button
                  onClick={() => onStartPlanning(destination)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Start Planning
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 