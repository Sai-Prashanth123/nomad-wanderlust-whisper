import React, { useState, useEffect } from 'react';
import { X, Heart, Search, Info, ChevronRight, Trash2, MapPin, Wifi, Shield, DollarSign, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { FavoritesContext } from './ResponseHandler';
import { DestinationDetailsModal } from './DestinationDetailsModal';

const FavoritesDashboard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  // Force component to re-render when opened
  const [renderKey, setRenderKey] = useState(0);
  const favoritesContext = React.useContext(FavoritesContext);
  const { favorites, removeFavorite, isFavorite } = favoritesContext;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Force a re-render when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setRenderKey(prev => prev + 1);
    }
  }, [isOpen]);

  // Reset loading state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // This gives Firebase time to fetch favorites
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, renderKey]);

  if (!isOpen) return null;

  const filteredFavorites = searchTerm.trim() === '' 
    ? favorites 
    : favorites.filter(destination => 
        destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.country.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleViewDetails = (destination: any) => {
    setSelectedDestination(destination);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setTimeout(() => {
      setSelectedDestination(null);
    }, 300);
  };

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

  console.log("Favorites in Dashboard:", favorites);
  console.log("Full favorites context:", favoritesContext);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-gray-900 text-white border-gray-700">
        <DialogHeader className="flex justify-between items-center border-b border-gray-800 mb-4 pb-3">
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Heart className="h-5 w-5 text-pink-500 mr-2" fill="#ec4899" />
            <span>Favorite Destinations</span>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-1 mb-4 relative">
          <Input
            type="text"
            placeholder="Search your favorites..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg pr-8 w-full"
          />
          {searchTerm && (
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Favorites grid */}
        <div className="flex-1 overflow-y-auto pb-4 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-pink-500 animate-spin mb-4" />
              <p className="text-gray-400">Loading your favorites...</p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No matching favorites found</h3>
                  <p className="text-gray-500 text-sm max-w-md">
                    Try a different search term or clear your search
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-gray-800/50 p-6 rounded-full mb-4">
                    <Heart className="h-12 w-12 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No favorites yet</h3>
                  <p className="text-gray-500 text-sm max-w-md">
                    Click the heart icon on any destination card to add it to your favorites
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map(destination => (
                <div 
                  key={destination.id}
                  className="group relative rounded-xl overflow-hidden backdrop-blur-sm bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700 shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-indigo-500/50"
                >
                  {/* Premium glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Image container with overlay */}
                  <div className="relative w-full h-48 overflow-hidden">
                    <img 
                      src={destination.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'} 
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 filter group-hover:brightness-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                    
                    {/* Remove from favorites button */}
                    <button 
                      className="absolute top-3 right-3 p-2 bg-pink-500/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500/60 transform transition-all duration-300 hover:scale-110 border border-pink-400/50 hover:border-red-400/50 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(destination.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-white transition-colors duration-300" />
                    </button>
                    
                    {/* Location badge */}
                    <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 text-xs text-white font-medium border border-white/10">
                      <MapPin className="h-3 w-3 text-purple-400" />
                      <span>{destination.country}</span>
                    </div>
                  </div>
                  
                  {/* Content area */}
                  <div className="p-4">
                    {/* City name with animated underline effect */}
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 pb-1 relative inline-block">
                      {destination.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    </h3>
                    
                    {/* Stats grid with premium styling */}
                    <div className="grid grid-cols-2 gap-2 my-3">
                      <div className="bg-gray-800/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-700/50 group-hover:border-purple-500/30 transition-all duration-300">
                        <div className="flex items-center text-xs">
                          <DollarSign className={`h-3 w-3 mr-1 ${getCostColor(destination.costOfLiving)}`} />
                          <span className="text-gray-400">Cost:</span>
                          <span className="ml-1 text-white">{destination.costOfLiving}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex items-center text-xs">
                          <Wifi className={`h-3 w-3 mr-1 ${getInternetColor(destination.internetSpeed)}`} />
                          <span className="text-gray-400">WiFi:</span>
                          <span className="ml-1 text-white">{destination.internetSpeed.split(' ')[0]}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-700/50 group-hover:border-green-500/30 transition-all duration-300">
                        <div className="flex items-center text-xs">
                          <Globe className={`h-3 w-3 mr-1 ${getVisaColor(destination.visaRequirements)}`} />
                          <span className="text-gray-400">Visa:</span>
                          <span className="ml-1 text-white">{destination.visaRequirements.split(' ')[0]}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-700/50 group-hover:border-yellow-500/30 transition-all duration-300">
                        <div className="flex items-center text-xs">
                          <Shield className={`h-3 w-3 mr-1 ${getSafetyColor(destination.safetyRating)}`} />
                          <span className="text-gray-400">Safety:</span>
                          <span className="ml-1 text-white">{destination.safetyRating}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* View details button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2 text-gray-300 hover:text-white hover:bg-gray-700/70 transition-all duration-300"
                      onClick={() => handleViewDetails(destination)}
                    >
                      <Info className="h-4 w-4 mr-1.5 text-blue-400" /> 
                      <span>View Details</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>

      <DestinationDetailsModal 
        destination={selectedDestination}
        open={detailsOpen}
        onClose={handleCloseDetails}
      />
    </Dialog>
  );
};

export default FavoritesDashboard; 