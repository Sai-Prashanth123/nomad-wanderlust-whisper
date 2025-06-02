import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Share,
  Info,
  X,
  MapPin,
  Globe,
  Wifi,
  Shield,
  Umbrella,
  Calendar,
  Users,
  DollarSign,
  Building,
  MessageSquare,
  Smartphone,
  Award,
  AlertTriangle,
  Coffee,
  Heart,
  Plane,
  Hotel,
  Briefcase,
  Clock,
  Check,
  Loader2,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DestinationDetailsModal } from './DestinationDetailsModal';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DestinationDeck } from './DestinationDeck';

// Define destination detail type
export interface DestinationDetail {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  costOfLiving: 'low' | 'medium' | 'high';
  internetSpeed: string;
  visaRequirements: string;
  climate: string;
  bestTimeToVisit: string[];
  nomadCommunity: string;
  safetyRating: number;
  monthlyRent: string;
  coworkingSpaces: number;
  wifiRating?: number;
  visaInfo?: string;
  safetySummary?: string;
  travelTip?: string;
  localFunFact?: string;
  coworkingCafes?: string[];
  simTip?: string;
  visaTip?: string;
  insiderTip?: string;
  weatherWatch?: string;
  wifiDetails?: string;
  canSave?: boolean;
}

// Context for managing favorites
interface FavoritesContextType {
  favorites: DestinationDetail[];
  toggleFavorite: (destination: DestinationDetail) => void;
  isFavorite: (destinationId: string) => boolean;
  removeFavorite: (destinationId: string) => void;
}

export const FavoritesContext = React.createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  removeFavorite: () => {},
});

export const FavoritesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Debug flag - set to true to use localStorage instead of Firebase
  // This is helpful for quick testing if Firebase has connection issues
  const USE_LOCAL_STORAGE = false;
  
  const [favorites, setFavorites] = useState<DestinationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Initialize from localStorage if debug mode is enabled
  useEffect(() => {
    if (USE_LOCAL_STORAGE) {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          setFavorites(parsed);
          console.log('Loaded favorites from localStorage:', parsed.length);
        } catch (e) {
          console.error('Error parsing localStorage favorites:', e);
        }
      }
      setLoading(false);
    }
  }, []);

  // Save to localStorage when favorites change (if in debug mode)
  useEffect(() => {
    if (USE_LOCAL_STORAGE && favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      console.log('Saved favorites to localStorage:', favorites.length);
    }
  }, [favorites]);

  // Load favorites from Firebase when user logs in
  useEffect(() => {
    if (USE_LOCAL_STORAGE) return;
    
    const loadFavorites = async () => {
      if (!currentUser) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Loading favorites for user ${currentUser.uid}`);
        
        // Create the user document if it doesn't exist (similar to chat functionality)
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log('User document does not exist, creating it');
          await setDoc(userDocRef, {
            email: currentUser.email,
            createdAt: new Date(),
            lastLogin: new Date()
          });
        }
        
        // Get user's favorites
        const favoritesRef = doc(db, 'users', currentUser.uid, 'preferences', 'favorites');
        const favoritesDoc = await getDoc(favoritesRef);
        
        if (favoritesDoc.exists()) {
          const favoritesData = favoritesDoc.data();
          setFavorites(favoritesData.destinations || []);
          console.log(`Loaded ${favoritesData.destinations?.length || 0} favorites, data:`, favoritesData.destinations);
        } else {
          // Create empty favorites document if it doesn't exist
          await setDoc(favoritesRef, { destinations: [] });
          setFavorites([]);
          console.log('Created empty favorites document');
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [currentUser]);

  // Save favorites to Firebase
  const saveFavoritesToFirebase = async (updatedFavorites: DestinationDetail[]) => {
    if (USE_LOCAL_STORAGE) {
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      console.log('Saved favorites to localStorage:', updatedFavorites.length);
      return;
    }
    
    if (!currentUser) return;
    
    try {
      const favoritesRef = doc(db, 'users', currentUser.uid, 'preferences', 'favorites');
      await setDoc(favoritesRef, { 
        destinations: updatedFavorites,
        updatedAt: new Date()
      });
      console.log('Favorites saved to Firebase successfully:', updatedFavorites.length, 'destinations');
    } catch (error) {
      console.error('Error saving favorites to Firebase:', error);
    }
  };

  const toggleFavorite = (destination: DestinationDetail) => {
    console.log('Toggle favorite called for:', destination.name);
    
    setFavorites(prev => {
      const exists = prev.some(fav => fav.id === destination.id);
      console.log('Destination exists in favorites:', exists);
      
      const updatedFavorites = exists
        ? prev.filter(fav => fav.id !== destination.id)
        : [...prev, destination];
      
      // Save to storage
      saveFavoritesToFirebase(updatedFavorites);
      
      return updatedFavorites;
    });
  };

  const isFavorite = (destinationId: string) => {
    return favorites.some(fav => fav.id === destinationId);
  };

  const removeFavorite = (destinationId: string) => {
    console.log('Remove favorite called for ID:', destinationId);
    
    setFavorites(prev => {
      const updatedFavorites = prev.filter(fav => fav.id !== destinationId);
      
      // Save to storage
      saveFavoritesToFirebase(updatedFavorites);
      
      return updatedFavorites;
    });
  };

  // Create context value object
  const contextValue = {
    favorites,
    toggleFavorite,
    isFavorite,
    removeFavorite
  };

  console.log('FavoritesProvider rendering with', favorites.length, 'favorites');

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Props for the ResponseHandler component
interface ResponseHandlerProps {
  response?: string;
  isLoading?: boolean;
  onNewMessage?: (message: {
    id: string;
    content: string;
    role: string;
    timestamp: Date;
    hasDestinations?: boolean;
    destinations?: DestinationDetail[];
    isTravel?: boolean;
  }) => void;
  onError?: (error: string) => void;
  onDestinationsLoaded?: (destinations: DestinationDetail[]) => void;
  onDestinationsError?: (error: string) => void;
}

// Card component for displaying destination previews
const DestinationCard: React.FC<{
  destination: DestinationDetail;
  onViewDetails: (dest: DestinationDetail) => void;
  onStartPlanning: (dest: DestinationDetail) => void;
}> = ({ destination, onViewDetails, onStartPlanning }) => {
  const { toggleFavorite, isFavorite } = React.useContext(FavoritesContext);
  const isFav = isFavorite(destination.id);

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCostColor = (cost: string) => {
    if (cost.toLowerCase() === 'low') return 'text-green-400';
    if (cost.toLowerCase() === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getInternetColor = (internet: string) => {
    if (internet.toLowerCase().includes('fast')) return 'text-green-400';
    if (internet.toLowerCase().includes('moderate')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getVisaColor = (visa: string) => {
    if (visa.toLowerCase().includes('easy')) return 'text-green-400';
    if (visa.toLowerCase().includes('moderate')) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="group relative rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-indigo-500/50">
      {/* Premium glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Image container with overlay and animations */}
      <div className="relative w-full h-52 overflow-hidden">
        <img 
          src={destination.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'} 
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter group-hover:brightness-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
        
        {/* Favorite button with animation */}
        <button 
          className={`absolute top-3 right-3 p-2 ${isFav ? 'bg-pink-500/60' : 'bg-black/30'} backdrop-blur-sm rounded-full text-white hover:bg-black/50 transform transition-all duration-300 hover:scale-110 border ${isFav ? 'border-pink-400/50' : 'border-gray-700/30'} hover:border-purple-400/50 shadow-md`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(destination);
          }}
        >
          <Heart className={`h-4 w-4 ${isFav ? 'text-white' : 'text-white group-hover:text-pink-400'} transition-colors duration-300`} fill={isFav ? "#ec4899" : "none"} />
        </button>
        
        {/* Location badge */}
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 text-xs text-white font-medium border border-white/10">
          <MapPin className="h-3 w-3 text-purple-400" />
          <span>{destination.country}</span>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-5">
        {/* City name with animated underline effect */}
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 pb-1 relative inline-block">
          {destination.name}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </h3>
        
        {/* Stats grid with premium styling */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 group-hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center mb-1">
              <DollarSign className={`h-4 w-4 mr-1 ${getCostColor(destination.costOfLiving)}`} />
              <span className="text-xs uppercase tracking-wider text-gray-400">Cost</span>
            </div>
            <p className="font-medium text-white">{destination.costOfLiving}</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center mb-1">
              <Wifi className={`h-4 w-4 mr-1 ${getInternetColor(destination.internetSpeed)}`} />
              <span className="text-xs uppercase tracking-wider text-gray-400">WiFi</span>
            </div>
            <p className="font-medium text-white">
              {destination.internetSpeed.toLowerCase().includes('fast') ? '80+ Mbps' : 
               destination.internetSpeed.toLowerCase().includes('moderate') ? '10-30 Mbps' : 
               '< 10 Mbps'}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 group-hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center mb-1">
              <Globe className={`h-4 w-4 mr-1 ${getVisaColor(destination.visaRequirements)}`} />
              <span className="text-xs uppercase tracking-wider text-gray-400">Visa</span>
            </div>
            <p className="font-medium text-white">Easy process</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700/50 group-hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center mb-1">
              <Shield className={`h-4 w-4 mr-1 ${getSafetyColor(destination.safetyRating)}`} />
              <span className="text-xs uppercase tracking-wider text-gray-400">Safety</span>
            </div>
            <p className="font-medium text-white">Very safe</p>
          </div>
        </div>
        
        {/* Insider tip with subtle animation */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-3 rounded-lg border border-purple-500/10 group-hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-start">
            <Coffee className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-300 leading-tight">
              {destination.insiderTip || "Check local Facebook groups for nomad meetups"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between mt-5 pt-4 border-t border-gray-700/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-gray-700/70 group/btn transition-all duration-300 relative z-10"
            onClick={() => onViewDetails(destination)}
          >
            <Info className="h-4 w-4 mr-1.5 group-hover/btn:text-blue-400 transition-colors duration-300" /> 
            <span className="group-hover/btn:translate-x-0.5 transition-transform duration-300">Details</span>
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg shadow-purple-700/20 transition-all duration-300 transform hover:scale-105"
            onClick={() => onStartPlanning(destination)}
          >
            Start Planning
          </Button>
        </div>
      </div>
    </div>
  );
};

// Interface for travel planning form data
interface PlanningFormData {
  destination: DestinationDetail;
  arrivalDate: string;
  departureDate: string;
  budget: string;
  travelStyle: string;
  stayType: string;
  activities: string[];
  workRemotely: boolean;
  notes: string;
}

// Planning modal component
const PlanningModal: React.FC<{
  destination: DestinationDetail | null;
  open: boolean;
  onClose: () => void;
}> = ({ destination, open, onClose }) => {
  const [formData, setFormData] = useState<Partial<PlanningFormData>>({
    budget: 'medium',
    travelStyle: 'balanced',
    stayType: 'hotel',
    activities: [],
    workRemotely: true,
    notes: ''
  });
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  if (!destination) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleActivityToggle = (activity: string) => {
    setFormData(prev => {
      const activities = prev.activities || [];
      return {
        ...prev,
        activities: activities.includes(activity)
          ? activities.filter(a => a !== activity)
          : [...activities, activity]
      };
    });
  };
  
  const nextStep = () => {
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const generatePlan = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Prepare request data
      const requestData = {
        destination: destination,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        budget: formData.budget || 'medium',
        travelStyle: formData.travelStyle || 'balanced',
        stayType: formData.stayType || 'hotel',
        activities: formData.activities || [],
        workRemotely: formData.workRemotely || false,
        notes: formData.notes
      };
      
      // Call the API
      const response = await fetch('https://nomadtravel.azurewebsites.net/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedPlan(data.plan);
      nextStep(); // Move to the next step to show the plan
    } catch (error) {
      console.error('Error generating plan:', error);
      setError('Failed to generate travel plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Planning a trip to {destination.name}</h3>
              <p className="text-gray-300 mb-2">Let's create a personalized itinerary for your stay in {destination.name}, {destination.country}.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="arrivalDate" className="text-gray-300">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  name="arrivalDate"
                  type="date"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={formData.arrivalDate || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="departureDate" className="text-gray-300">Departure Date</Label>
                <Input
                  id="departureDate"
                  name="departureDate"
                  type="date"
                  className="bg-gray-800 border-gray-700 text-white"
                  value={formData.departureDate || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="budget" className="text-gray-300 mb-2 block">Budget</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('budget', value)}
                value={formData.budget || 'medium'}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your budget" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="budget">Budget / Backpacker</SelectItem>
                  <SelectItem value="medium">Mid-range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Next <Plane className="ml-2 h-4 w-4"/>
              </Button>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Travel Preferences</h3>
              <p className="text-gray-300 mb-2">Tell us about your travel style and preferences.</p>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="travelStyle" className="text-gray-300 mb-2 block">Travel Style</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('travelStyle', value)}
                value={formData.travelStyle || 'balanced'}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select your travel style" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="slow">Slow Travel (few activities, deep immersion)</SelectItem>
                  <SelectItem value="balanced">Balanced (mix of activities and downtime)</SelectItem>
                  <SelectItem value="packed">Packed Itinerary (see and do as much as possible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="stayType" className="text-gray-300 mb-2 block">Accommodation Preference</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('stayType', value)}
                value={formData.stayType || 'hotel'}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select accommodation type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="hostel">Hostel / Budget</SelectItem>
                  <SelectItem value="apartment">Apartment / Airbnb</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="luxury">Luxury Resort</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6">
              <Label className="text-gray-300 mb-2 block">Activities (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cultural" 
                    checked={(formData.activities || []).includes('cultural')}
                    onCheckedChange={(checked) => 
                      handleActivityToggle('cultural')
                    }
                  />
                  <label 
                    htmlFor="cultural"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Cultural / Museums
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="nature" 
                    checked={(formData.activities || []).includes('nature')}
                    onCheckedChange={(checked) => 
                      handleActivityToggle('nature')
                    }
                  />
                  <label 
                    htmlFor="nature"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Nature / Outdoors
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="food" 
                    checked={(formData.activities || []).includes('food')}
                    onCheckedChange={(checked) => 
                      handleActivityToggle('food')
                    }
                  />
                  <label 
                    htmlFor="food"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Food / Culinary
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="nightlife" 
                    checked={(formData.activities || []).includes('nightlife')}
                    onCheckedChange={(checked) => 
                      handleActivityToggle('nightlife')
                    }
                  />
                  <label 
                    htmlFor="nightlife"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Nightlife
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="shopping" 
                    checked={(formData.activities || []).includes('shopping')}
                    onCheckedChange={(checked) => 
                      handleActivityToggle('shopping')
                    }
                  />
                  <label 
                    htmlFor="shopping"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Shopping
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="work" 
                    checked={(formData.activities || []).includes('work')}
                    onCheckedChange={(checked) => 
                      handleActivityToggle('work')
                    }
                  />
                  <label 
                    htmlFor="work"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    Work / Coworking
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={prevStep}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                Back
              </Button>
              <Button 
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Next <Plane className="ml-2 h-4 w-4"/>
              </Button>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Digital Nomad Details</h3>
              <p className="text-gray-300 mb-2">Let us know about your work situation while traveling.</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="workRemotely" 
                  checked={formData.workRemotely || false}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('workRemotely', checked as boolean)
                  }
                />
                <label 
                  htmlFor="workRemotely"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                >
                  I'll be working remotely during this trip
                </label>
              </div>
              
              {formData.workRemotely && (
                <div className="pl-6 border-l-2 border-gray-700 ml-1">
                  <p className="text-gray-400 text-sm mb-2">
                    Internet speed in {destination.name}: <span className="text-white">{destination.internetSpeed}</span>
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    Coworking spaces: <span className="text-white">{destination.coworkingSpaces}</span>
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    WiFi details: <span className="text-white">{destination.wifiDetails || "Information not available"}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <Label htmlFor="notes" className="text-gray-300 mb-2 block">Any special requests or notes?</Label>
              <Textarea
                id="notes"
                name="notes"
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                placeholder="Tell us anything else that might help customize your travel plan..."
                value={formData.notes || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={prevStep}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                Back
              </Button>
              <Button 
                onClick={generatePlan}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>Generating <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>Generate Travel Plan <Briefcase className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </>
        );
        
      case 4:
        return (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Your {destination.name} Travel Plan</h3>
              <div className="flex items-center space-x-2 text-gray-300 mb-4">
                <Clock className="h-4 w-4 text-green-500" />
                <span>Plan generated with AI based on your preferences</span>
              </div>
            </div>
            
            {error ? (
              <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-medium">Error generating plan</p>
                    <p className="text-gray-300 text-sm">{error}</p>
                    <Button 
                      onClick={generatePlan}
                      className="mt-3 bg-red-700 hover:bg-red-800"
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Retrying...' : 'Retry'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/60 p-4 rounded-lg mb-6 overflow-auto max-h-[400px]">
                <div className="prose prose-invert max-w-none">
                  {generatedPlan ? (
                    <div className="whitespace-pre-wrap font-sans text-sm text-gray-300 markdown-content">
                      {generatedPlan.split('\n').map((line, index) => {
                        // Convert markdown headings to styled text
                        if (line.startsWith('# ')) {
                          return <h1 key={index} className="text-2xl font-bold mt-4 mb-3">{line.substring(2)}</h1>;
                        } else if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-xl font-semibold mt-4 mb-2 text-purple-300">{line.substring(3)}</h2>;
                        } else if (line.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-medium mt-3 mb-2 text-blue-300">{line.substring(4)}</h3>;
                        } else if (line.startsWith('- ')) {
                          return <div key={index} className="pl-4 mb-1 flex"><span className="mr-2">•</span>{line.substring(2)}</div>;
                        } else if (line.trim() === '') {
                          return <div key={index} className="h-2"></div>;
                        } else {
                          return <p key={index} className="mb-2">{line}</p>;
                        }
                      })}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      <span className="ml-3 text-purple-300">Generating your travel plan...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button 
                onClick={prevStep}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                Edit Details
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => {
                  if (generatedPlan) {
                    navigator.clipboard.writeText(generatedPlan)
                      .then(() => alert('Travel plan copied to clipboard!'))
                      .catch(err => console.error('Failed to copy:', err));
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Plan
              </Button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {step < 4 ? "Plan Your Trip" : "Your Travel Plan"}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        {/* Progress indicator */}
        {step < 4 && (
          <div className="w-full bg-gray-800 h-2 rounded-full mb-6">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        )}
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

// Destination cards container
const DestinationCardDeck: React.FC<{
  destinations: DestinationDetail[];
}> = ({ destinations }) => {
  const [selectedDestination, setSelectedDestination] = useState<DestinationDetail | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const handleViewDetails = (destination: DestinationDetail) => {
    console.log('View details clicked for:', destination.name);
    setSelectedDestination(destination);
    setDetailsOpen(true);
    console.log('Details modal should open, detailsOpen:', true);
  };

  const handleStartPlanning = (destination: DestinationDetail) => {
    setSelectedDestination(destination);
    setPlanningOpen(true);
  };

  const handleCloseDetails = () => {
    console.log('Closing details modal');
    setDetailsOpen(false);
    // Add a small delay before clearing the destination to avoid UI flicker
    setTimeout(() => {
      setSelectedDestination(null);
    }, 300);
  };

  const handleClosePlanning = () => {
    setPlanningOpen(false);
    setSelectedDestination(null);
  };
  
  // Listen for startPlanning event from DestinationDetailsModal
  React.useEffect(() => {
    const handlePlanningEvent = (event: CustomEvent) => {
      const { destinationId } = event.detail;
      const destination = destinations.find(d => d.id === destinationId);
      if (destination) {
        handleStartPlanning(destination);
      }
    };
    
    document.addEventListener('startPlanning', handlePlanningEvent as EventListener);
    
    return () => {
      document.removeEventListener('startPlanning', handlePlanningEvent as EventListener);
    };
  }, [destinations]);

  // Monitor modal state changes
  React.useEffect(() => {
    console.log('Details modal state changed:', { 
      isOpen: detailsOpen, 
      hasDestination: !!selectedDestination,
      destinationName: selectedDestination?.name 
    });
  }, [detailsOpen, selectedDestination]);

  return (
    <div className="relative pb-4">
      {/* Premium header */}
      <div className="mb-8 relative">
        <h2 className="text-2xl font-bold text-white mb-2 relative z-10 inline-block">
          Suggested Destinations for You
          <div className="absolute -bottom-1 left-0 h-1 w-40 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
        </h2>
        <p className="text-gray-400 max-w-2xl relative z-10">Personalized recommendations based on your preferences and search history.</p>
        
        {/* Background decorative element */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Cards grid with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {/* Decorative background elements */}
        <div className="absolute -z-10 top-1/3 left-1/4 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -z-10 bottom-1/4 right-1/4 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        {destinations.map((destination, index) => (
          <div 
            key={destination.id}
            className="transform transition-all duration-500"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <DestinationCard 
              destination={destination}
              onViewDetails={handleViewDetails}
              onStartPlanning={handleStartPlanning}
            />
          </div>
        ))}
      </div>
      
      <DestinationDetailsModal 
        destination={selectedDestination}
        open={detailsOpen}
        onClose={handleCloseDetails}
      />

      <PlanningModal
        destination={selectedDestination}
        open={planningOpen}
        onClose={handleClosePlanning}
      />

      <FavoritesSidebar
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        onViewDetails={(dest) => {
          setSelectedDestination(dest);
          setDetailsOpen(true);
          setFavoritesOpen(false);
        }}
      />
    </div>
  );
};

// FavoritesSidebar component
export const FavoritesSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (dest: DestinationDetail) => void;
}> = ({ isOpen, onClose, onViewDetails }) => {
  const { favorites, removeFavorite } = React.useContext(FavoritesContext);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 shadow-xl z-50 overflow-hidden flex flex-col transition-all duration-300 transform">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Heart className="h-5 w-5 text-pink-500 mr-2" fill="#ec4899" /> 
          <span>Favorite Destinations</span>
        </h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="bg-gray-800/50 p-6 rounded-full mb-4">
              <Heart className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No favorites yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Click the heart icon on any destination card to add it to your favorites for quick access.
            </p>
          </div>
        ) : (
          <div className="space-y-2 px-2">
            {favorites.map(destination => (
              <div 
                key={destination.id}
                className="group bg-gray-800/50 hover:bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500/50 transition-all duration-200"
              >
                <div className="flex items-center p-2">
                  <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 mr-3 border border-gray-700">
                    <img 
                      src={destination.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'} 
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{destination.name}</h4>
                    <p className="text-gray-400 text-sm truncate">{destination.country}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => removeFavorite(destination.id)}
                      className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-red-400"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onViewDetails(destination)}
                      className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-blue-400"
                      title="View details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main ResponseHandler component
export const ResponseHandler: React.FC<ResponseHandlerProps> = ({
  response,
  isLoading,
  onNewMessage,
  onError,
  onDestinationsLoaded,
  onDestinationsError
}) => {
  const [destinations, setDestinations] = useState<DestinationDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');

  useEffect(() => {
    if (!response) return;

    const processResponse = async () => {
      setError(null);

      try {
        // Parse the response
        const parsedResponse = JSON.parse(response);
        console.log('Parsed response:', parsedResponse);

        // Set the AI response text
        setAiResponse(parsedResponse.friendlyAiReply || '');

        // Check if we have destinations in the response
        if (parsedResponse.cities && Array.isArray(parsedResponse.cities)) {
          setDestinations(parsedResponse.cities);
          onDestinationsLoaded?.(parsedResponse.cities);

          // Create a message with destinations
          onNewMessage({
            id: Date.now().toString(),
            content: parsedResponse.friendlyAiReply || 'Here are some destinations you might like:',
            role: 'assistant',
            timestamp: new Date(),
            hasDestinations: true,
            destinations: parsedResponse.cities,
            isTravel: true
          });
        } else {
          // Regular message without destinations
          onNewMessage({
            id: Date.now().toString(),
            content: parsedResponse.friendlyAiReply || response,
            role: 'assistant',
            timestamp: new Date()
          });
        }
      } catch (err) {
        console.error('Error processing response:', err);
        setError('Failed to process the response');
        onDestinationsError?.('Failed to process destinations');
        
        // Still show the response as a regular message
        onNewMessage({
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date()
        });
      }
    };

    processResponse();
  }, [response, onNewMessage, onDestinationsLoaded, onDestinationsError]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-gray-500">Processing response...</div>;
  }

  return (
    <>
      {/* AI Response Container */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="prose prose-sm max-w-none">
          {aiResponse}
        </div>
      </div>

      {/* Destinations Grid - Completely Separate from Response */}
      {destinations.length > 0 && (
        <div className="w-full">
          <DestinationDeck
            destinations={destinations}
            className="bg-gray-50"
          />
        </div>
      )}
    </>
  );
};

export default ResponseHandler; 