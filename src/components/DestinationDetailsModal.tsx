import React from 'react';
import {
  X,
  DollarSign,
  Wifi,
  Globe,
  Shield,
  Umbrella,
  Building,
  Users,
  Calendar,
  Award,
  MessageSquare,
  Smartphone,
  ThermometerSnowflake,
  CheckCircle,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DestinationDetail } from './ResponseHandler';

// Destination details modal component
export const DestinationDetailsModal: React.FC<{
  destination: DestinationDetail | null;
  open: boolean;
  onClose: () => void;
}> = ({ destination, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        {destination ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {destination.name}
              </DialogTitle>
              <DialogClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </DialogClose>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="rounded-lg overflow-hidden mb-4">
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-64 object-cover"
                  />
                </div>

                <h3 className="text-lg font-semibold mb-2">Quick Facts</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                    <span>Monthly Rent: {destination.monthlyRent}</span>
                  </div>
                  <div className="flex items-center">
                    <Wifi className="h-4 w-4 mr-1 text-blue-400" />
                    <span>Internet: {destination.internetSpeed}</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1 text-purple-400" />
                    <span>Visa: {destination.visaRequirements}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>Safety: {destination.safetyRating}/5</span>
                  </div>
                  <div className="flex items-center">
                    <Umbrella className="h-4 w-4 mr-1 text-cyan-400" />
                    <span>Climate: {destination.climate}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1 text-indigo-400" />
                    <span>Coworking: {destination.coworkingSpaces}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <ThermometerSnowflake className="h-4 w-4 mr-2 mt-1 text-cyan-400" />
                    <div>
                      <span className="font-medium">Weather Watch</span>
                      <p className="text-gray-400 text-sm">{destination.weatherWatch}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-1 text-green-400" />
                    <div>
                      <span className="font-medium">Best Time to Visit</span>
                      <p className="text-gray-400 text-sm">{destination.bestTimeToVisit.join(', ')}</p>
                    </div>
                  </div>

                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">About {destination.name}</h3>
                <p className="text-gray-300 mb-4">{destination.description}</p>

                <h3 className="text-lg font-semibold mb-2">Digital Nomad Info</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <Users className="h-4 w-4 mr-2 mt-1 text-blue-400" />
                    <div>
                      <span className="font-medium">Nomad Community</span>
                      <p className="text-gray-400 text-sm">{destination.nomadCommunity}</p>
                    </div>
                  </div>

                  {destination.wifiDetails && (
                    <div className="flex items-start">
                      <Wifi className="h-4 w-4 mr-2 mt-1 text-blue-400" />
                      <div>
                        <span className="font-medium">WiFi Details</span>
                        <p className="text-gray-400 text-sm">{destination.wifiDetails}</p>
                      </div>
                    </div>
                  )}

                  {destination.simTip && (
                    <div className="flex items-start">
                      <Smartphone className="h-4 w-4 mr-2 mt-1 text-orange-400" />
                      <div>
                        <span className="font-medium">SIM Card Tip</span>
                        <p className="text-gray-400 text-sm">{destination.simTip}</p>
                      </div>
                    </div>
                  )}

                  {destination.visaTip && (
                    <div className="flex items-start">
                      <Globe className="h-4 w-4 mr-2 mt-1 text-purple-400" />
                      <div>
                        <span className="font-medium">Visa Tip</span>
                        <p className="text-gray-400 text-sm">{destination.visaTip}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Award className="h-4 w-4 mr-2 mt-1 text-yellow-400" />
                    <div>
                      <span className="font-medium">Insider Tip</span>
                      <p className="text-gray-400 text-sm">{destination.insiderTip}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 mr-2 mt-1 text-purple-400" />
                    <div>
                      <span className="font-medium">Fun Fact</span>
                      <p className="text-gray-400 text-sm">{destination.localFunFact}</p>
                    </div>
                  </div>


                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="mr-2 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Close
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => {
                      // Close this modal and open planning
                      onClose();
                      // We need to trigger planning from the parent component
                      document.dispatchEvent(new CustomEvent('startPlanning', { detail: { destinationId: destination.id } }));
                    }}
                  >
                    Start Planning
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="animate-spin mb-4 mx-auto h-8 w-8 border-2 border-gray-600 border-t-purple-500 rounded-full"></div>
            <p className="text-gray-400">Loading destination details...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 