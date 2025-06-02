import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, X, ChevronDown, ArrowLeft, Copy, Clipboard } from 'lucide-react';
import axios from 'axios';

// Updated interface to match what's used in ResponseHandler.tsx
interface DestinationDetail {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  costOfLiving: 'low' | 'medium' | 'high';
  internetSpeed: string;
  visaRequirements: string;
  climate?: string;
  bestTimeToVisit?: string[];
  nomadCommunity?: string;
  safetyRating: number;
  monthlyRent?: string;
  coworkingSpaces?: number;
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

interface TripPlanningModalProps {
  destination: DestinationDetail | null;
  open: boolean;
  onClose: () => void;
}

interface TripPlan {
  plan: string;
  session_id?: string;
}

const TripPlanningModal: React.FC<TripPlanningModalProps> = ({
  destination,
  open,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    arrivalDate: '',
    departureDate: '',
    budget: '',
    travelStyle: 'balanced',
    stayType: 'hotel',
    activities: [],
    workRemotely: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<string | null>(null);
  const [tripCost, setTripCost] = useState<string>("$200");

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Submit form data to generate trip plan
      await generateTripPlan();
    }
  };

  const generateTripPlan = async () => {
    if (!destination) return;
    
    setLoading(true);
    try {
      // Make API call to generate trip plan
      const response = await axios.post('/api/generate-plan', {
        destination,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        budget: formData.budget,
        travelStyle: formData.travelStyle,
        stayType: formData.stayType,
        activities: formData.activities,
        workRemotely: formData.activities.includes('Work / co-working'),
        notes: formData.notes
      });

      // Extract trip plan from response
      const generatedPlan = response.data?.plan || generateMockTripPlan(destination);
      setTripPlan(generatedPlan);
      
      // Extract or calculate trip cost (in a real app, this would come from the API)
      const costMatch = generatedPlan.match(/\$(\d+)/);
      setTripCost(costMatch ? `$${costMatch[1]}` : "$200");
      
      // Move to the final step
      setStep(3);
    } catch (error) {
      console.error('Failed to generate trip plan:', error);
      // Fallback to mock data in case of error
      setTripPlan(generateMockTripPlan(destination));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback function to generate a mock trip plan for demo purposes
  const generateMockTripPlan = (destination: DestinationDetail) => {
    return `
# ${destination.name} Travel Itinerary

## Overview

Hey hey! 🌴 So, you're heading to ${destination.name}, ${destination.country}—what a vibe! This quaint little coastal gem in ${destination.country} is perfect for a balanced mix of work, cultural exploration, and that sweet luxury life you're into. With its tropical charm, stunning beaches, and laid-back vibes, ${destination.name} is where you can hustle remotely by day and soak in sunsets by night. May is technically off-season, but don't worry—fewer crowds = more space to enjoy paradise. Plus, luxury stays here are chef's kiss without breaking the bank. Let's dive into your dream trip!

## Digital Nomad Setup

Okay, let's talk work mode first. The internet in ${destination.name} is decent, but not lightning-fast, so if you're planning to work remotely, here's what you need to know:

- **Best Coworking Spaces**: Check out ${destination.coworkingCafes?.[0] || "Local Hub"} and ${destination.coworkingCafes?.[1] || "Beach Work"} for decent WiFi and good vibes
- **Backup Internet**: Grab a local SIM card from Airtel or Jio as soon as you land (around $10 for 2GB/day)
- **Power Situation**: Occasional outages happen, so bring a power bank
- **Best Work-Friendly Cafés**: ${destination.coworkingCafes?.[2] || "Coastal Coffee"} has the best ocean view while working

## Day 1: Arrival & Settling In

- **Morning**: Airport pickup, check-in at your ${formData.stayType}
- **Afternoon**: Light exploration of the neighborhood, pick up essentials
- **Evening**: Sunset dinner at a beachfront restaurant
- **Cost**: ~$60 (including transport from airport)

## Day 2: Orientation & Beach Day

- **Morning**: Breakfast at your accommodation, work session if needed
- **Afternoon**: Visit the main beach for swimming and relaxation
- **Evening**: Seafood dinner at a local favorite spot
- **Cost**: ~$40

## Day 3: Cultural Immersion

- **Morning**: Visit the local markets and historical sites
- **Afternoon**: Try local cuisine at authentic eateries
- **Evening**: Traditional music performance if available
- **Cost**: ~$35

## Day 4: Adventure Day

- **Morning**: Hiking or water sports depending on your preference
- **Afternoon**: Continued activities or relaxation
- **Evening**: Beachfront dining and drinks
- **Cost**: ~$65 (including activity fees)

## Accommodation Recommendations

Based on your preference for ${formData.stayType}:
- **Luxury Option**: Ocean View Resort ($120-150/night)
- **Mid-range Option**: Palm Tree Cottages ($80-100/night)
- **Budget Luxury**: Sea Breeze Boutique Stay ($60-80/night)

## Transportation

- **Getting Around**: Rent a scooter ($8-10/day) or use local taxis
- **Airport Transfers**: Pre-book for best rates ($20-25 each way)

## Estimated Total Budget: $200

This trip plan is customized based on your preferences for a balanced mix of activities and downtime, luxury ${formData.stayType} accommodation, and interests in ${formData.activities.join(', ')}.

Enjoy your stay in beautiful ${destination.name}!
    `;
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleActivityToggle = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleCopyPlan = () => {
    if (tripPlan) {
      navigator.clipboard.writeText(tripPlan);
      alert("Trip plan copied to clipboard!");
    }
  };

  if (!destination) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="p-0 border-none flex flex-col overflow-hidden"
        style={{
          width: '860px',
          height: '600px',
          flexShrink: 0,
          borderRadius: '10px',
          background: '#FFF',
          boxShadow: '9px 9px 28.9px 0px rgba(198, 110, 78, 0.16)',
          maxWidth: '860px',
          maxHeight: '600px'
        }}
      >
        {/* Progress Bar */}
        <div 
          className="bg-gray-200 flex-shrink-0"
          style={{
            width: '860px',
            height: '18px',
            flexShrink: 0,
            background: '#D9D9D9'
          }}
        >
          <div 
            className="bg-[#C66E4E] h-full transition-all duration-300"
            style={{ 
              width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' 
            }}
          ></div>
        </div>
        
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center w-full">
            {step > 1 && (
              <button onClick={handlePrevious} className="mr-3">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <DialogTitle className="text-xl font-bold flex-1 text-gray-900">Plan Your Trip</DialogTitle>
          </div>
          {/* Horizontal line below title */}
          <div 
            style={{
              width: '776px',
              height: '0px',
              flexShrink: 0,
              borderTop: '1px solid rgba(0, 0, 0, 0.24)',
              marginTop: '16px'
            }}
          ></div>
        </DialogHeader>

        <div className="flex-1 px-6 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(600px - 18px - 80px - 100px)' }}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">Trip to {destination.name}</h2>
                <p className="text-gray-600 text-sm">
                  Let's create a personalized itinerary for your stay in {destination.name.toLowerCase()}, {destination.country}.
                </p>
                
                <button className="flex items-center text-[#C66E4E] text-sm mt-3 hover:underline">
                  <span className="mr-2 text-[#C66E4E] font-bold">⊕</span> 
                  More locations from chat
                </button>
              </div>

              <div className="space-y-4">
                {/* Arrival and Departure Dates - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Arrival Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E]"
                        value={formData.arrivalDate}
                        onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Departure Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E]"
                        value={formData.departureDate}
                        onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Budget</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E] appearance-none bg-white"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    >
                      <option value="">Select budget range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500-5000">$2,500 - $5,000</option>
                      <option value="5000-plus">$5,000+</option>
                      <option value="custom">Custom amount</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">Travel Preference</h2>
                <p className="text-gray-600 text-sm">
                  Tell us about your travel style and preferences.
                </p>
              </div>

              <div className="space-y-4">
                {/* Travel Style */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Travel Style</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E] appearance-none bg-white"
                      value={formData.travelStyle}
                      onChange={(e) => setFormData({...formData, travelStyle: e.target.value})}
                    >
                      <option value="balanced">Balanced (mix of activities and downtime)</option>
                      <option value="relaxed">Relaxed (lots of downtime)</option>
                      <option value="active">Active (packed with activities)</option>
                      <option value="adventure">Adventure (outdoor activities)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>

                {/* Accommodation Preference */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Accommodation Preference</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E] appearance-none bg-white"
                      value={formData.stayType}
                      onChange={(e) => setFormData({...formData, stayType: e.target.value})}
                    >
                      <option value="hotel">Hotel</option>
                      <option value="hostel">Hostel</option>
                      <option value="airbnb">Airbnb</option>
                      <option value="resort">Resort</option>
                      <option value="guesthouse">Guesthouse</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="block font-medium text-gray-900 mb-3">Activities (Select All That Apply)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Cultural / Museums',
                      'Nature / Outdoors',
                      'Food / Culinary',
                      'Night life',
                      'Shopping',
                      'Work / co-working'
                    ].map((activity) => (
                      <div key={activity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={activity}
                          checked={formData.activities.includes(activity)}
                          onChange={() => handleActivityToggle(activity)}
                          className="w-4 h-4 text-[#C66E4E] border-gray-300 rounded focus:ring-[#C66E4E]"
                        />
                        <label htmlFor={activity} className="text-sm text-gray-700 cursor-pointer">
                          {activity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E]"
                    rows={3}
                    placeholder="Any special requests or preferences..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold mb-1 text-gray-900">Your {destination.name} Travel Plan</h2>
                  <p className="text-gray-600 text-sm">Plan generated with AI based on your preferences</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Trip cost</div>
                  <div className="text-xl font-bold text-[#C66E4E]">{tripCost}</div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C66E4E]"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm relative">
                  <button 
                    onClick={handleCopyPlan}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Clipboard className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-bold mb-4">{destination.name} Travel Itinerary</h3>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm mb-3">
                      {tripPlan?.split('## Overview')[1]?.split('##')[0]?.trim() || 
                      `Hey hey! 🌴 So, you're heading to ${destination.name}, ${destination.country}—what a vibe! This quaint little coastal gem in ${destination.country} is perfect for a balanced mix of work, cultural exploration, and that sweet luxury life you're into.`}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Digital Nomad Setup</h4>
                    <p className="text-sm">
                      The internet in {destination.name} is {destination.internetSpeed}. {destination.wifiDetails}
                    </p>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                      <li>Best Coworking Spaces: {destination.coworkingCafes?.[0] || "Local cafés"}</li>
                      <li>SIM Card: {destination.simTip?.split('.')[0] || "Available at the airport"}</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Day-by-Day Itinerary</h4>
                    {/* Sample daily itinerary - this would be populated from the API response */}
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">Day 1: Arrival & Settling In</p>
                        <p className="text-gray-600 pl-3">Airport pickup, check-in, neighborhood exploration</p>
                      </div>
                      <div>
                        <p className="font-medium">Day 2: Orientation & Beach Day</p>
                        <p className="text-gray-600 pl-3">Beach relaxation, local seafood dinner</p>
                      </div>
                      <div>
                        <p className="font-medium">Day 3: Cultural Immersion</p>
                        <p className="text-gray-600 pl-3">Markets, historical sites, authentic cuisine</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Accommodation</h4>
                    <p className="text-sm">
                      Based on your preference for {formData.stayType}:
                    </p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      <li>Luxury Option: Ocean View Resort ($120-150/night)</li>
                      <li>Mid-range Option: Palm Tree Cottages ($80-100/night)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 pt-2 mt-auto flex-shrink-0">
          <div className="flex gap-4">
            {step === 3 ? (
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-300 text-gray-700"
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={step === 1 ? handleClose : handlePrevious}
                  className="flex-1 border-gray-300 text-gray-700"
                >
                  {step === 1 ? 'Back' : 'Back'}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 bg-[#C66E4E] hover:bg-[#b66245] text-white"
                >
                  {step === 2 ? (loading ? 'Generating...' : 'Done') : 'Next'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Demo component to show the modal
const TripPlanningDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sampleDestination: DestinationDetail = {
    id: "1",
    name: "Bambolim",
    country: "India",
    imageUrl: "/sample-destination.jpg",
    description: "A beautiful destination in India",
    costOfLiving: "low",
    internetSpeed: "30 Mbps",
    visaRequirements: "Easy",
    safetyRating: 4
  };

  return (
    <div className="p-8 flex justify-center">
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#C66E4E] hover:bg-[#b66245] text-white"
      >
        Open Trip Planning Modal
      </Button>
      
      <TripPlanningModal
        destination={sampleDestination}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default TripPlanningModal;