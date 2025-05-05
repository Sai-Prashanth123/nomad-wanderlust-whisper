import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  DollarSign, 
  Clipboard, 
  Shield,
  AlertTriangle,
  Sun, 
  CloudRain, 
  Coffee, 
  Map, 
  Heart,
  ExternalLink,
  Info,
  Lightbulb,
  LightbulbOff,
  Save
} from 'lucide-react';
import { CardDetailsModal } from './CardDetailsModal';

export interface Destination {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  costOfLiving: 'low' | 'medium' | 'high';
  internetSpeed: 'slow' | 'medium' | 'fast';
  visaRequirements: 'easy' | 'moderate' | 'difficult';
  climate: 'tropical' | 'temperate' | 'arid' | 'continental';
  bestTimeToVisit: string[];
  nomadCommunity: 'small' | 'growing' | 'large';
  safetyRating: number;
  monthlyRent: string;
  coworkingSpaces: number;
  
  // Additional detailed information
  wifiRating?: number;
  visaInfo?: string;
  safetySummary?: string;
  travelTip?: string;
  
  // New fields for enhanced data display
  localFunFact?: string;
  coworkingCafes?: string[];
  simTip?: string;
  visaTip?: string;
  insiderTip?: string;
  weatherWatch?: string;
  wifiDetails?: string;
  canSave?: boolean;
}

interface DestinationCardProps {
  destination: Destination;
  isCompact?: boolean;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, isCompact = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Generate city-specific detailed info if not provided
  const getCostRange = () => {
    switch(destination.name) {
      case "Bengaluru": return "$700–$1000/month";
      case "Goa": return "$500–$800/month";
      case "Hyderabad": return "$600–$900/month";
      case "Bangkok": return "$800–$1200/month";
      case "Chiang Mai": return "$600–$900/month";
      case "Bali": return "$700–$1100/month";
      case "Da Nang": return "$500–$800/month";
      default: return destination.monthlyRent || "$600-1000/month";
    }
  };

  const getWifiInfo = () => {
    switch(destination.name) {
      case "Bengaluru": return "100 Mbps (avg) – 4.5/5 rating";
      case "Goa": return "50 Mbps (avg) – 3.5/5 rating";
      case "Hyderabad": return "80 Mbps (avg) – 4/5 rating";
      case "Bangkok": return "150 Mbps (avg) – 4.5/5 rating";
      case "Chiang Mai": return "90 Mbps (avg) – 4/5 rating";
      case "Bali": return "40 Mbps (avg) – 3/5 rating";
      case "Da Nang": return "80–120 Mbps in cafés, consistent for video calls";
      default: return destination.internetSpeed === "fast" ? "80+ Mbps" : 
               destination.internetSpeed === "medium" ? "30-80 Mbps" : "10-30 Mbps";
    }
  };

  const getVisaInfo = () => {
    switch(destination.name) {
      case "Bengaluru": 
      case "Goa":
      case "Hyderabad": return "30-day eVisa for most nationalities";
      case "Bangkok":
      case "Chiang Mai": return "30-day visa-on-arrival for most visitors";
      case "Bali": return "30-day visa-free for many nationalities";
      case "Da Nang": return "30-day eVisa online → can extend locally for 30 more days";
      default: return destination.visaRequirements === "easy" ? "Easy visa process" : 
               destination.visaRequirements === "moderate" ? "Standard visa process" : "Complex visa process";
    }
  };

  const getSafetyInfo = () => {
    switch(destination.name) {
      case "Bengaluru": return "Very safe for solo travelers";
      case "Goa": return "Generally safe, watch for tourist scams";
      case "Hyderabad": return "Safe, use standard precautions";
      case "Bangkok": return "Safe in tourist areas, stay alert at night";
      case "Chiang Mai": return "Very safe, low crime rate";
      case "Bali": return "Safe, beware of motorbike accidents";
      case "Da Nang": return "Very safe, low crime rate, friendly locals";
      default: return destination.safetyRating >= 4 ? "Very safe" : 
               destination.safetyRating >= 3 ? "Mostly safe" : "Exercise caution";
    }
  };

  const getTravelTip = () => {
    switch(destination.name) {
      case "Bengaluru": return "Best coworking spaces in Indiranagar and Koramangala";
      case "Goa": return "Avoid rainy season (June–Sept) for beach days";
      case "Hyderabad": return "Visit the old city for authentic biryani";
      case "Bangkok": return "Use BTS Skytrain to avoid traffic congestion";
      case "Chiang Mai": return "Sunday Night Market is a must-visit";
      case "Bali": return "North Bali is less crowded than South"; 
      case "Da Nang": return "Locals love the night market near Dragon Bridge — amazing food! 🐉";
      default: return "Check local Facebook groups for nomad meetups";
    }
  };

  // Extended information for the detailed view
  const getLocalFunFact = () => {
    switch(destination.name) {
      case "Bengaluru": return "Known as the 'Garden City' with over 400 parks and gardens 🌳";
      case "Goa": return "Was a Portuguese colony for 450 years until 1961 🏛️";
      case "Hyderabad": return "Home to the world's largest film studio complex, Ramoji Film City 🎬";
      case "Bangkok": return "Full name is longest city name in the world with 169 characters 📚";
      case "Chiang Mai": return "Surrounded by over 300 ancient temples dating back to 1296 🏯";
      case "Bali": return "Locals celebrate Nyepi, a 'Day of Silence' when the entire island shuts down 🤫";
      case "Da Nang": return "Marble Mountains nearby are epic for sunrise hikes 🌄";
      default: return "Rich in culture and history worth exploring";
    }
  };

  const getCoworkingCafes = () => {
    switch(destination.name) {
      case "Bengaluru": return ["Dyu Art Cafe", "Third Wave Coffee", "Matteo Coffea"];
      case "Goa": return ["Baba Au Rhum", "Bean Me Up", "Artjuna Cafe"];
      case "Hyderabad": return ["Roastery Coffee House", "Autumn Leaf Cafe", "Ciclo Cafe"];
      case "Bangkok": return ["Hubba Thailand", "The Work Loft", "Hom Hostel & Cooking Club"];
      case "Chiang Mai": return ["The Barn", "Yellow Coworking", "Wake Up Coffee"];
      case "Bali": return ["Dojo Bali", "Outpost", "Tropical Nomad"];
      case "Da Nang": return ["The Espresso Station", "HeX Co-Working", "85 Design Café"];
      default: return ["Local coffee shops", "Coworking spaces available"];
    }
  };

  const getSimTip = () => {
    switch(destination.name) {
      case "Bengaluru": 
      case "Goa":
      case "Hyderabad": return "Jio or Airtel SIM available at airport (~$5 for 1.5GB/day)";
      case "Bangkok":
      case "Chiang Mai": return "AIS or True Move SIM at airport (~$15 for 15GB/week)";
      case "Bali": return "Telkomsel SIM widely available (~$8 for 10GB)";
      case "Da Nang": return "Grab a Viettel SIM at the airport (~$5 for 5GB/day) — super reliable";
      default: return "Local SIM cards available at airports and convenience stores";
    }
  };

  const getWeatherWatch = () => {
    switch(destination.name) {
      case "Bengaluru": return "Best time: Oct–Feb; Avoid Apr–Jun (hot)";
      case "Goa": return "Best time: Nov–Feb; Avoid Jun–Sep (monsoon)";
      case "Hyderabad": return "Best time: Oct–Mar; Hot summers Apr–Jun";
      case "Bangkok": return "Best time: Nov–Feb; Hot Mar–May; Rainy Jun–Oct";
      case "Chiang Mai": return "Best time: Nov–Feb; Smoky Mar–Apr; Rainy Jun–Oct";
      case "Bali": return "Best time: Apr–Oct; Rainy Nov–Mar";
      case "Da Nang": return "Best time: March–August; Rainy Sept–Nov";
      default: return `Best time: ${destination.bestTimeToVisit.join(", ")}`;
    }
  };

  // Collapsed view with enhanced information
  const renderCollapsedView = () => {
    return (
      <div className="p-3">
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs">
            <span className="text-white flex items-center font-semibold">
              <DollarSign className="h-3.5 w-3.5 mr-1 text-green-400" /> Cost: {getCostRange()}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-white flex items-center font-semibold">
              <Wifi className="h-3.5 w-3.5 mr-1 text-blue-400" /> WiFi: {getWifiInfo()}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-white flex items-center font-semibold">
              <Clipboard className="h-3.5 w-3.5 mr-1 text-purple-400" /> Visa: {getVisaInfo()}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-white flex items-center font-semibold">
              <Shield className="h-3.5 w-3.5 mr-1 text-yellow-400" /> Safety: {getSafetyInfo()}
            </span>
          </div>
          <div className="flex items-center text-xs">
            <span className="text-white flex items-center font-semibold">
              <Lightbulb className="h-3.5 w-3.5 mr-1 text-amber-400" /> Tip: {getTravelTip()}
            </span>
          </div>
        </div>
        
        {/* Card actions */}
        <div className="flex justify-between items-center mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Info className="h-3.5 w-3.5 mr-1.5" />
            <span>Details</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-800/30 rounded-lg"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            <span>Explore</span>
          </Button>
        </div>
      </div>
    );
  };

  // Legacy display for backward compatibility
  const renderLegacyView = () => {
    return (
      <div className="p-3">
        {/* Key stats with icons */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-3">
          {renderWifiIndicator(destination.internetSpeed)}
          {renderCostIndicator(destination.costOfLiving)}
          {renderVisaIndicator(destination.visaRequirements)}
          {renderClimateIndicator(destination.climate)}
          {renderCommunityIndicator(destination.nomadCommunity)}
          <div className="flex items-center text-xs">
            <span className="flex items-center">
              <span className="mr-1">🛋️</span> {destination.coworkingSpaces}+ spaces
            </span>
          </div>
        </div>
        
        {/* Card actions */}
        <div className="flex justify-between items-center mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 text-gray-300 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Info className="h-3.5 w-3.5 mr-1.5" />
            <span>Details</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-800/30 rounded-lg"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            <span>Explore</span>
          </Button>
        </div>
      </div>
    );
  };

  // Helper functions for legacy rendering
  const renderWifiIndicator = (speed: 'slow' | 'medium' | 'fast') => {
    return (
      <div className="flex items-center text-xs">
        <Wifi className={`h-3.5 w-3.5 mr-1 ${
          speed === 'fast' ? 'text-green-400' :
          speed === 'medium' ? 'text-yellow-400' : 'text-red-400'
        }`} />
        <span>
          {speed === 'fast' ? '30+ Mbps' :
           speed === 'medium' ? '15-30 Mbps' : '<15 Mbps'}
        </span>
      </div>
    );
  };

  const renderCostIndicator = (cost: 'low' | 'medium' | 'high') => {
    return (
      <div className="flex items-center text-xs">
        <DollarSign className={`h-3.5 w-3.5 mr-1 ${
          cost === 'low' ? 'text-green-400' :
          cost === 'medium' ? 'text-yellow-400' : 'text-red-400'
        }`} />
        <span>{cost}</span>
      </div>
    );
  };

  const renderVisaIndicator = (visa: 'easy' | 'moderate' | 'difficult') => {
    return (
      <div className="flex items-center text-xs">
        <Clipboard className={`h-3.5 w-3.5 mr-1 ${
          visa === 'easy' ? 'text-green-400' :
          visa === 'moderate' ? 'text-yellow-400' : 'text-red-400'
        }`} />
        <span>
          {visa === 'easy' ? 'Easy visa' :
           visa === 'moderate' ? 'Moderate' : 'Difficult'}
        </span>
      </div>
    );
  };

  const renderClimateIndicator = (climate: 'tropical' | 'temperate' | 'arid' | 'continental') => {
    const Icon = climate === 'tropical' || climate === 'temperate' ? Sun : CloudRain;
    
    return (
      <div className="flex items-center text-xs">
        <Icon className="h-3.5 w-3.5 mr-1 text-blue-400" />
        <span>{climate.charAt(0).toUpperCase() + climate.slice(1)}</span>
      </div>
    );
  };

  const renderCommunityIndicator = (community: 'small' | 'growing' | 'large') => {
    return (
      <div className="flex items-center text-xs">
        <Coffee className={`h-3.5 w-3.5 mr-1 ${
          community === 'large' ? 'text-green-400' :
          community === 'growing' ? 'text-yellow-400' : 'text-gray-400'
        }`} />
        <span>
          {community === 'large' ? 'Large community' :
           community === 'growing' ? 'Growing' : 'Small'}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="relative group overflow-hidden rounded-xl bg-gray-800/60 backdrop-blur-sm border border-gray-700 transition-all duration-300 hover:shadow-[0_0_15px_rgba(138,43,226,0.15)] hover:border-purple-500/30">
        {/* Card image with gradient overlay */}
        <div className="relative h-36 overflow-hidden">
          <img 
            src={destination.imageUrl} 
            alt={destination.name} 
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
          
          {/* Location badge */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div>
              <h3 className="text-white font-semibold">{destination.name}</h3>
              <div className="flex items-center text-gray-300 text-xs">
                <Map className="h-3 w-3 mr-1" />
                <span>{destination.country}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50 hover:text-white"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Card content */}
        {renderCollapsedView()}
      </div>

      {/* Modal for detailed view */}
      {isModalOpen && (
        <CardDetailsModal
          destination={{
            ...destination,
            localFunFact: destination.localFunFact || getLocalFunFact(),
            coworkingCafes: destination.coworkingCafes || getCoworkingCafes(),
            simTip: destination.simTip || getSimTip(),
            visaTip: destination.visaTip || getVisaInfo(),
            insiderTip: destination.insiderTip || getTravelTip(),
            weatherWatch: destination.weatherWatch || getWeatherWatch(),
            wifiDetails: destination.wifiDetails || getWifiInfo(),
            canSave: destination.canSave !== undefined ? destination.canSave : true,
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default DestinationCard;
