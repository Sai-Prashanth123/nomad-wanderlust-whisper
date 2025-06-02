import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  MapPin,
  Wifi,
  Shield,
  DollarSign,
  Globe,
  Calendar,
  Coffee,
  Smartphone,
  Building,
  Users,
  Info,
  Star
} from 'lucide-react';
import { DestinationDetail } from './ResponseHandler';

interface DestinationDetailsModalProps {
  destination: DestinationDetail | null;
  open: boolean;
  onClose: () => void;
}

export const DestinationDetailsModal: React.FC<DestinationDetailsModalProps> = ({
  destination,
  open,
  onClose
}) => {
  if (!destination) return null;

  const handleStartPlanning = () => {
    const event = new CustomEvent('startPlanning', {
      detail: { destinationId: destination.id }
    });
    document.dispatchEvent(event);
    onClose();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= Math.floor(rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-gray-50 text-gray-900 p-0 overflow-hidden max-w-md mx-auto border-2 border-blue-500"
        style={{
          maxWidth: '580px',
          maxHeight: '85vh',
          borderRadius: '12px'
        }}
      >
        {/* Top section - Image on left, destination info on right */}
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            {/* Image - Left side */}
            <div className="w-[252px] h-[145px] flex-shrink-0">
              <img
                src={destination.imageUrl}
                alt={destination.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Destination info - Right side */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {destination.name}
              </h1>

              <div className="flex items-center space-x-2 mb-2">
                <span className="text-base font-semibold">{destination.safetyRating.toFixed(1)}</span>
                {renderStars(destination.safetyRating)}
              </div>

              <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
                {destination.description || `Discover ${destination.name}, a unique destination perfect for digital nomads and travelers.`}
              </p>
            </div>
          </div>

          {/* Main content in two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Digital Nomad Info column */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-gray-900">{destination.name} Info</h2>

              <div className="space-y-2">
                {/* Nomad Community */}
                <div className="flex items-start space-x-2">
                  <Users className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs text-gray-700">{destination.name} Community</p>
                    <p className="text-xs text-black leading-tight font-medium">
                      {destination.nomadCommunity || "Growing digital nomad community"}
                    </p>
                  </div>
                </div>

                {/* Wi-Fi Details */}
                <div className="flex items-start space-x-2">
                  <Wifi className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs text-gray-700">Wi-Fi Details</p>
                    <p className="text-xs text-black leading-tight font-medium">
                      {destination.wifiDetails || "Wi-Fi available in most hotels and cafes"}
                    </p>
                  </div>
                </div>

                {/* SIM card tip */}
                <div className="flex items-start space-x-2">
                  <Smartphone className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs text-gray-700">SIM card tip</p>
                    <p className="text-xs text-black leading-tight font-medium">
                      {destination.simTip || "Check visa requirements for your nationality"}
                    </p>
                  </div>
                </div>

                {/* Visa tip */}
                <div className="flex items-start space-x-2">
                  <Globe className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs text-gray-700">Visa tip</p>
                    <p className="text-xs text-black leading-tight font-medium">
                      {destination.visaTip || "Check visa requirements for your nationality"}
                    </p>
                  </div>
                </div>

                {/* Insider tip */}
                <div className="flex items-start space-x-2">
                  <Info className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs text-gray-700">Insider tip</p>
                    <p className="text-xs text-black leading-tight font-medium">
                      {destination.insiderTip || `Explore ${destination.name} like a local for the best experience`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Facts column */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-gray-900">Quick Facts</h2>

              <div className="grid grid-cols-2 gap-x-3">
                {/* Left column */}

                <div className="space-y-2">
                  {/* Monthly Rent */}
                  <div className="flex items-start space-x-2">
                    <DollarSign className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">Monthly Rent</p>
                      <p className="text-xs text-black leading-tight font-medium">
                        {destination.monthlyRent || "Varies by location"}
                      </p>
                    </div>
                  </div>

                  {/* Internet */}
                  <div className="flex items-start space-x-2">
                    <Wifi className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">Internet</p>
                      <p className="text-xs text-black leading-tight font-medium">
                        {destination.internetSpeed || "Good"}
                      </p>
                    </div>
                  </div>

                  {/* Visa */}
                  <div className="flex items-start space-x-2">
                    <Globe className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">Visa</p>
                      <p className="text-xs text-black leading-tight font-medium">
                        {destination.visaRequirements || "Check requirements"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-2">
                  {/* Co-working */}
                  <div className="flex items-start space-x-2">
                    <Building className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">Co-working</p>
                      <p className="text-xs text-black leading-tight font-medium">
                        {destination.coworkingSpaces || "Limited"}
                      </p>
                    </div>
                  </div>

                  {/* Safety */}
                  <div className="flex items-start space-x-2">
                    <Shield className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">Safety</p>
                      <p className="text-xs text-black leading-tight font-medium">
                        {destination.safetyRating.toFixed(1)}/5
                      </p>
                    </div>
                  </div>

                  {/* Best time to visit */}
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-xs text-gray-700">Best time to visit</p>
                      <p className="text-xs text-black leading-tight font-medium">
                        {destination.bestTimeToVisit || "Year-round"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fun fact */}
              <div className="flex items-start space-x-2 mt-2">
                <Info className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-xs text-gray-700">Fun fact</p>
                  <p className="text-xs text-black leading-tight font-medium">
                    {destination.localFunFact || `${destination.name} offers unique experiences for every traveler`}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300 bg-white hover:bg-gray-50 text-sm h-9"
                >
                  Back
                </Button>
                <Button
                  onClick={handleStartPlanning}
                  className="bg-[#C66E4E] hover:bg-[#b66245] text-white text-sm h-9"
                >
                  Start Planning
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};