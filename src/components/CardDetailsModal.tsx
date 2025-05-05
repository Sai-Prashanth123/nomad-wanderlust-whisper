import React, { useEffect, useState } from 'react';
import { 
  X,   
  Wifi, 
  DollarSign, 
  Clipboard, 
  Sun, 
  Coffee, 
  Map, 
  Calendar, 
  Shield, 
  Globe,
  ThumbsUp,
  Building,
  Utensils,
  Bus,
  CheckCircle,
  AlertTriangle,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Destination } from './DestinationCard';
import { motion, AnimatePresence } from 'framer-motion';
import { TrailPlannerCTA } from './TrailPlannerCTA';

interface CardDetailsModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ 
  destination, 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lifestyle' | 'tips'>('overview');
  
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const renderVisaRequirements = () => {
    const visaInfo: Record<string, React.ReactNode> = {
      'easy': (
        <div className="flex items-center text-green-400">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>Easy to obtain (e-visa or visa on arrival)</span>
        </div>
      ),
      'moderate': (
        <div className="flex items-center text-yellow-400">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Application required, processing time 1-2 weeks</span>
        </div>
      ),
      'difficult': (
        <div className="flex items-center text-red-400">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Complex process, may require sponsorship or proof of funds</span>
        </div>
      )
    };
    
    return visaInfo[destination.visaRequirements] || null;
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            className="relative bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-gray-800"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 rounded-full p-1.5 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Hero image */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img 
                src={destination.imageUrl} 
                alt={destination.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
              
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-400 mr-2" />
                      <h2 className="text-2xl font-bold text-white">{destination.name}</h2>
                    </div>
                    <p className="text-gray-300 flex items-center mt-1">
                      <Map className="h-4 w-4 mr-1.5" />
                      {destination.country}
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-1.5">
                    <div className="text-white text-sm font-medium">
                      {
                        destination.costOfLiving === 'low' ? '💰 Budget-friendly' :
                        destination.costOfLiving === 'medium' ? '💰💰 Moderate' : '💰💰💰 Premium'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button 
                className={`px-4 py-3 text-sm font-medium flex-1 ${activeTab === 'overview' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-4 py-3 text-sm font-medium flex-1 ${activeTab === 'lifestyle' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('lifestyle')}
              >
                Digital Nomad Life
              </button>
              <button 
                className={`px-4 py-3 text-sm font-medium flex-1 ${activeTab === 'tips' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('tips')}
              >
                Local Tips
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <p className="text-gray-300 leading-relaxed">
                    {destination.description}
                  </p>
                  
                  <div className="bg-gray-800/60 rounded-lg p-5 space-y-4">
                    {/* Local Fun Fact */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">📸</span>
                      <div>
                        <span className="text-white font-medium">Local Fun Fact</span>
                        <p className="text-gray-300 mt-1">{destination.localFunFact}</p>
                      </div>
                    </div>
                    
                    {/* Coworking Cafés */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">💻</span>
                      <div>
                        <span className="text-white font-medium">Coworking Cafés</span>
                        <ul className="text-gray-300 mt-1 space-y-1 pl-1">
                          {destination.coworkingCafes?.map((cafe, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">-</span>
                              <span>{cafe} {index === 0 ? '☕' : index === 1 ? '🔌' : '🌿'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* SIM Tips */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">📱</span>
                      <div>
                        <span className="text-white font-medium">SIM Tips</span>
                        <p className="text-gray-300 mt-1">{destination.simTip}</p>
                      </div>
                    </div>
                    
                    {/* WiFi */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">🌐</span>
                      <div>
                        <span className="text-white font-medium">WiFi</span>
                        <p className="text-gray-300 mt-1">{destination.wifiDetails}</p>
                      </div>
                    </div>
                    
                    {/* Visa Tip */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">🛂</span>
                      <div>
                        <span className="text-white font-medium">Visa Tip ({destination.country})</span>
                        <p className="text-gray-300 mt-1">{destination.visaTip}</p>
                      </div>
                    </div>
                    
                    {/* Insider Tip */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">💡</span>
                      <div>
                        <span className="text-white font-medium">Insider Tip</span>
                        <p className="text-gray-300 mt-1">{destination.insiderTip}</p>
                      </div>
                    </div>
                    
                    {/* Weather Watch */}
                    <div className="flex">
                      <span className="text-purple-400 mr-2 font-bold">🌈</span>
                      <div>
                        <span className="text-white font-medium">Weather Watch</span>
                        <p className="text-gray-300 mt-1">{destination.weatherWatch}</p>
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    {destination.canSave && (
                      <div className="flex">
                        <span className="text-purple-400 mr-2 font-bold">💾</span>
                        <div>
                          <span className="text-white font-medium">Save Option</span>
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-500/20 hover:bg-green-600/30 text-green-300 border-green-500/30 hover:text-green-200"
                            >
                              <Save className="h-3.5 w-3.5 mr-1.5" />
                              Add to My Trail
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'lifestyle' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <Coffee className="h-5 w-5 text-yellow-400 mr-2" />
                      Nomad Community
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm">
                        {destination.nomadCommunity === 'large' ? 
                          'Thriving digital nomad scene with regular meetups, events, and a strong expat community.' :
                         destination.nomadCommunity === 'growing' ?
                          'Growing digital nomad community with some organized events and an emerging expat scene.' :
                          'Small but friendly digital nomad community. You might need to be more proactive to connect.'}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-full border border-purple-500/30">
                          #NomadLife
                        </span>
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-500/30">
                          #CommunityEvents
                        </span>
                        <span className="bg-green-500/20 text-green-300 text-xs px-2.5 py-1 rounded-full border border-green-500/30">
                          #ColivingOptions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Building className="h-5 w-5 text-blue-400 mr-2" />
                        Accommodation
                      </h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>Both short-term and long-term rentals available. Consider these areas:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          <li>City Center - convenient but pricier</li>
                          <li>Outskirts - better value, quieter environment</li>
                        </ul>
                        <p className="text-xs text-gray-400 mt-2">
                          💡 Pro tip: For stays over 1 month, negotiate directly with landlords for better rates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Utensils className="h-5 w-5 text-green-400 mr-2" />
                        Food & Dining
                      </h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>
                          {destination.country === 'Thailand' || destination.country === 'Vietnam' ? 
                            'Amazing street food scene with plenty of affordable local and international options.' :
                            'Mix of local and international cuisine, with options for all budgets.'}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <span className="mr-2">🥘</span> Local food is typically the most affordable option
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="mr-2">🥑</span> Vegetarian options are {destination.country === 'India' || destination.country === 'Thailand' ? 'widely' : 'moderately'} available
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Shield className="h-5 w-5 text-red-400 mr-2" />
                        Safety & Health
                      </h3>
                      <div className="flex items-center mb-3">
                        <div className="text-gray-400 text-sm mr-2">Safety rating:</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star} className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              star <= destination.safetyRating ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-600'
                            }`}>
                              ★
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>
                          {destination.safetyRating >= 4 ? 
                            'Generally very safe for tourists and digital nomads, even at night.' :
                            destination.safetyRating >= 3 ?
                            'Mostly safe in tourist areas, but take standard precautions, especially at night.' :
                            'Exercise caution, particularly after dark. Stick to well-lit, populated areas.'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          💊 Healthcare: {destination.safetyRating >= 4 ? 'Excellent quality healthcare available' : 'Adequate medical facilities in major cities'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3 flex items-center">
                        <Bus className="h-5 w-5 text-yellow-400 mr-2" />
                        Getting Around
                      </h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Public transport:</span>
                          <span>{destination.country === 'Thailand' || destination.country === 'Japan' ? 'Excellent' : 'Adequate'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ridesharing apps:</span>
                          <span>{destination.country === 'United States' || destination.country === 'Mexico' ? 'Widely available' : 'Available in major areas'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Scooter/bike rentals:</span>
                          <span>{destination.country === 'Thailand' || destination.country === 'Vietnam' || destination.country === 'Indonesia' ? 'Very common' : 'Available'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Walkability:</span>
                          <span>{destination.name === 'Chiang Mai' || destination.name === 'Lisbon' ? 'Good' : 'Moderate'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tips' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <ThumbsUp className="h-5 w-5 text-purple-400 mr-2" />
                      Nomad Tips
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex">
                        <span className="text-purple-400 mr-2">💼</span>
                        <p>Best coworking: {destination.name === 'Chiang Mai' ? 'CAMP, Punspace' : 'Check local listings for options'}</p>
                      </div>
                      <div className="flex">
                        <span className="text-purple-400 mr-2">🌐</span>
                        <p>Get a local SIM card upon arrival for reliable connectivity</p>
                      </div>
                      <div className="flex">
                        <span className="text-purple-400 mr-2">💵</span>
                        <p>Use local banking apps like {destination.country === 'Thailand' ? 'TrueMoney' : destination.country === 'Indonesia' ? 'GoPay, OVO' : 'local payment apps'} for convenience</p>
                      </div>
                      <div className="flex">
                        <span className="text-purple-400 mr-2">🏠</span>
                        <p>For long stays, check Facebook groups for best rental deals</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Hidden Gems 💎</h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex">
                        <span className="text-yellow-400 mr-2">🍜</span>
                        <p>Try the local street food at {destination.name === 'Bangkok' ? 'Chatuchak Weekend Market' : 'the night markets'} for authentic flavors</p>
                      </div>
                      <div className="flex">
                        <span className="text-green-400 mr-2">🌳</span>
                        <p>Escape the city to {destination.country === 'Thailand' ? 'Doi Suthep' : destination.country === 'Indonesia' ? 'Tegallalang Rice Terraces' : 'nearby natural attractions'} for breathtaking views</p>
                      </div>
                      <div className="flex">
                        <span className="text-blue-400 mr-2">🎨</span>
                        <p>Explore the local art scene at {destination.country === 'Portugal' ? 'LX Factory' : 'local galleries and markets'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Cultural Do's & Don'ts</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="text-green-400 text-xs font-medium mb-2 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> DO
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex">
                            <span className="mr-2">👍</span>
                            <span>Learn basic local phrases</span>
                          </li>
                          <li className="flex">
                            <span className="mr-2">👍</span>
                            <span>Respect local customs and traditions</span>
                          </li>
                          <li className="flex">
                            <span className="mr-2">👍</span>
                            <span>Try local cuisine and specialties</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-red-400 text-xs font-medium mb-2 flex items-center">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> DON'T
                        </h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex">
                            <span className="mr-2">👎</span>
                            <span>Disrespect religious sites</span>
                          </li>
                          <li className="flex">
                            <span className="mr-2">👎</span>
                            <span>Expect everyone to speak English</span>
                          </li>
                          <li className="flex">
                            <span className="mr-2">👎</span>
                            <span>Overstay your visa</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <TrailPlannerCTA destination={destination} />
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-800 p-4 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Information last updated: May 2023
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={onClose}>
                  Close
                </Button>
                <Button size="sm" className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white">
                  Save to Favorites
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 