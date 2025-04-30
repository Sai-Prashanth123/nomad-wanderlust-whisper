
import React, { useState, useRef, useEffect } from 'react';

export interface DestinationCardProps {
  name: string;
  country: string;
  costOfLiving: string;
  wifiRating: number;
  visaTip: string;
  safety: number;
  economicStability: number;
  insiderTip: string;
  imageUrl: string;
  detailedDescription: string;
  index: number;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
  name,
  country,
  costOfLiving,
  wifiRating,
  visaTip,
  safety,
  economicStability,
  insiderTip,
  imageUrl,
  detailedDescription,
  index
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Staggered animation delay based on card index
  const animationDelay = 200 + (index * 150);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      // Set custom properties for expansion animation
      cardRef.current.style.setProperty('--collapsed-height', `${cardRef.current.scrollHeight}px`);
      cardRef.current.style.setProperty('--expanded-height', `${cardRef.current.scrollHeight + 200}px`);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Helper function to render WiFi rating
  const renderWifiRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-nomad-teal' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Helper function to render safety or economic stability rating
  const renderRatingBar = (rating: number, color: string) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${rating * 10}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl card-shadow card-shadow-hover overflow-hidden
                 ${isExpanded ? "ring-2 ring-nomad-blue" : "cursor-pointer"}
                 transform transition-all animate-fade-in`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={!isExpanded ? toggleExpand : undefined}
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb"}
          alt={`${name}, ${country}`}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-white font-bold text-xl">{name}</h3>
            <p className="text-white/80 text-sm">{country}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Cost of Living</p>
            <p className="font-semibold text-nomad-dark">{costOfLiving}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">WiFi</p>
            {renderWifiRating(wifiRating)}
          </div>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">Visa</p>
          <p className="text-sm">{visaTip}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Safety</p>
            {renderRatingBar(safety, "bg-nomad-green")}
          </div>
          <div>
            <p className="text-xs text-gray-500">Economy</p>
            {renderRatingBar(economicStability, "bg-nomad-yellow")}
          </div>
        </div>
        
        <div className="bg-nomad-light rounded-lg p-3">
          <p className="text-xs text-gray-500">Insider Tip</p>
          <p className="text-sm italic">{insiderTip}</p>
        </div>
        
        {isExpanded && (
          <div className="mt-4 animate-fade-in">
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-medium text-lg mb-2">More about {name}</h4>
              <p className="text-sm text-gray-700">{detailedDescription}</p>
              
              <div className="mt-6 space-y-3">
                <h5 className="font-medium text-sm">Popular with Digital Nomads because:</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="bg-nomad-light p-1 rounded-full">
                      <svg className="w-3 h-3 text-nomad-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs">Coworking spaces</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-nomad-light p-1 rounded-full">
                      <svg className="w-3 h-3 text-nomad-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs">Nomad community</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-nomad-light p-1 rounded-full">
                      <svg className="w-3 h-3 text-nomad-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs">Affordable living</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-nomad-light p-1 rounded-full">
                      <svg className="w-3 h-3 text-nomad-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs">Easy local transport</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button className="bg-nomad-light text-nomad-dark text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Explore More
                </button>
                <button 
                  className="text-sm text-nomad-blue hover:text-nomad-dark transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand();
                  }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;
