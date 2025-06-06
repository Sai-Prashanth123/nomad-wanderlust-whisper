import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, X, ChevronDown, ArrowLeft, Copy, Clipboard, CalendarIcon, MapPin, DollarSign, Wifi, Globe, Shield, Heart, Check, Plus, ChevronRight, Clock, Users, Camera, Utensils, Briefcase, Home, Plane, Star, Lightbulb, Phone } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  availableDestinations?: DestinationDetail[];
}

interface TripPlan {
  plan: string;
  session_id?: string;
}

const TripPlanningModal: React.FC<TripPlanningModalProps> = ({
  destination,
  open,
  onClose,
  availableDestinations = []
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    arrivalDate: '',
    departureDate: '',
    budget: '',
    customBudget: '',
    travelStyle: 'balanced',
    stayType: 'hotel',
    activities: [],
    workRemotely: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState<string | null>(null);
  const [tripCost, setTripCost] = useState<string>("$200");
  const [showDestinations, setShowDestinations] = useState(false);
  const [selectedDestinations, setSelectedDestinations] = useState<DestinationDetail[]>(destination ? [destination] : []);
  
  // Date picker states
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [departureDate, setDepartureDate] = useState<Date>();
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [departureOpen, setDepartureOpen] = useState(false);

  // Update selectedDestinations when destination prop changes
  React.useEffect(() => {
    if (destination && !selectedDestinations.find(d => d.id === destination.id)) {
      setSelectedDestinations([destination]);
    }
  }, [destination]);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Submit form data to generate trip plan
      await generateTripPlan();
    }
  };

  const generateTripPlan = async () => {
    if (!selectedDestinations.length) return;
    
    setLoading(true);
    try {
      // Prepare the API request payload
      const requestPayload = {
        destinations: selectedDestinations,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        budget: formData.budget,
        customBudget: formData.customBudget,
        travelStyle: formData.travelStyle,
        stayType: formData.stayType,
        activities: formData.activities,
        workRemotely: formData.activities.includes('Work / co-working'),
        notes: formData.notes
      };

      console.log('Sending trip planning request:', requestPayload);

      // Make API call to the backend
      const response = await fetch('http://localhost:8007/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`Failed to generate trip plan: ${response.status}`);
      }

      const data = await response.json();
      console.log('Trip plan response:', data);

      // Set the generated plan and cost
      setTripPlan(data.plan || generateMockTripPlan(selectedDestinations));
      setTripCost(data.estimatedCost || calculateDynamicCost(selectedDestinations, formData));
      
      // Move to the final step
      setStep(3);
    } catch (error) {
      console.error('Failed to generate trip plan:', error);
      
      // Fallback to mock data in case of API error
      setTripPlan(generateMockTripPlan(selectedDestinations));
      setTripCost(calculateDynamicCost(selectedDestinations, formData));
      setStep(3);
      
      // Show user-friendly error message
      alert('Unable to connect to the trip planning service. Showing a sample plan instead.');
    } finally {
      setLoading(false);
    }
  };
  
  // Updated fallback function to generate a mock trip plan for multiple destinations
  const generateMockTripPlan = (destinations: DestinationDetail[]) => {
    const isMultiCity = destinations.length > 1;
    const primaryDestination = destinations[0];
    const destinationNames = destinations.map(d => d.name).join(', ');
    const countries = [...new Set(destinations.map(d => d.country))];
    const countryText = countries.length === 1 ? countries[0] : countries.join(' and ');

    return `
# ${isMultiCity ? 'Multi-City' : primaryDestination.name} Travel Itinerary

## Overview

${isMultiCity ? 
  `Hey hey! 🌍 So, you're planning an epic multi-city adventure through ${destinationNames}—what an incredible journey! This ${destinations.length}-city tour across ${countryText} is perfect for getting a real taste of different cultures, vibes, and experiences. You'll get to experience the unique charm of each destination while maintaining that perfect work-life balance you're after. This is going to be absolutely amazing!` 
  : 
  `Hey hey! 🌴 So, you're heading to ${primaryDestination.name}, ${primaryDestination.country}—what a vibe! This quaint little coastal gem in ${primaryDestination.country} is perfect for a balanced mix of work, cultural exploration, and that sweet luxury life you're into.`
}

## Digital Nomad Setup

${isMultiCity ? 
  `Working remotely across multiple cities? No problem! Here's your connectivity game plan:

${destinations.map((dest, index) => `
**${dest.name}:**
- Internet: ${dest.internetSpeed} - ${dest.wifiDetails || 'Good coverage throughout the city'}
- Best Coworking: ${dest.coworkingCafes?.[0] || "Local coworking hubs"}
- SIM Tip: ${dest.simTip || "Local SIM available at airport"}
`).join('')}

**General Multi-City Work Tips:**
- Get portable WiFi hotspot for seamless connectivity between cities
- Download offline maps and translation apps
- Pack universal power adapters`
  :
  `Okay, let's talk work mode first. The internet in ${primaryDestination.name} is decent, but not lightning-fast, so if you're planning to work remotely, here's what you need to know:

- **Best Coworking Spaces**: Check out ${primaryDestination.coworkingCafes?.[0] || "Local Hub"} and ${primaryDestination.coworkingCafes?.[1] || "Beach Work"} for decent WiFi and good vibes
- **Backup Internet**: Grab a local SIM card as soon as you land
- **Power Situation**: Occasional outages happen, so bring a power bank`
}

${isMultiCity ? 
destinations.map((dest, index) => `
## ${dest.name} (Days ${index * 3 + 1}-${index * 3 + 3})

### Day ${index * 3 + 1}: Arrival in ${dest.name}
- **Morning**: ${index === 0 ? 'Airport pickup and' : 'Travel from previous city and'} check-in at your ${formData.stayType}
- **Afternoon**: Neighborhood orientation and local SIM card setup
- **Evening**: Welcome dinner at a local favorite restaurant
- **Cost**: ~$${60 + index * 10}

### Day ${index * 3 + 2}: Explore ${dest.name}
- **Morning**: ${formData.activities.includes('Cultural / Museums') ? 'Visit local museums and cultural sites' : 'Local market exploration'}
- **Afternoon**: ${formData.activities.includes('Nature / Outdoors') ? 'Outdoor activities and nature spots' : 'City walking tour'}
- **Evening**: ${formData.activities.includes('Night life') ? 'Experience local nightlife' : 'Relaxing evening meal'}
- **Cost**: ~$${50 + index * 15}

### Day ${index * 3 + 3}: Deep Dive ${dest.name}
- **Morning**: Work session at ${dest.coworkingCafes?.[0] || 'local café'} (if remote work)
- **Afternoon**: ${formData.activities.includes('Food / Culinary') ? 'Food tour and cooking class' : 'Local experiences and shopping'}
- **Evening**: ${index === destinations.length - 1 ? 'Farewell dinner' : 'Preparation for next city'}
- **Cost**: ~$${45 + index * 12}
`).join('')
:
`## Day 1: Arrival & Settling In

- **Morning**: Airport pickup, check-in at your ${formData.stayType}
- **Afternoon**: Light exploration of the neighborhood, pick up essentials
- **Evening**: Sunset dinner at a beachfront restaurant
- **Cost**: ~$60

## Day 2: Orientation & Beach Day

- **Morning**: Breakfast at your accommodation, work session if needed
- **Afternoon**: Visit the main beach for swimming and relaxation
- **Evening**: Seafood dinner at a local favorite spot
- **Cost**: ~$40

## Day 3: Cultural Immersion

- **Morning**: Visit the local markets and historical sites
- **Afternoon**: Try local cuisine at authentic eateries
- **Evening**: Traditional music performance if available
- **Cost**: ~$35`}

## Accommodation Recommendations

${isMultiCity ?
`**Multi-City Stay Strategy**: Based on your preference for ${formData.stayType}:

${destinations.map(dest => `
**${dest.name}:**
- Luxury: Premium hotel/resort ($120-150/night)
- Mid-range: Boutique ${formData.stayType} ($80-100/night)
- Budget: Clean, central location ($60-80/night)
`).join('')}`
:
`Based on your preference for ${formData.stayType}:
- **Luxury Option**: Ocean View Resort ($120-150/night)
- **Mid-range Option**: Palm Tree Cottages ($80-100/night)
- **Budget Luxury**: Sea Breeze Boutique Stay ($60-80/night)`}

## Transportation

${isMultiCity ?
`**Multi-City Travel:**
- Flights between cities: Budget $50-150 per flight
- Ground transport: Trains/buses where available
- Local transport: Mix of rideshare, public transport, and walking
- **Pro tip**: Book inter-city transport in advance for better rates!`
:
`- **Getting Around**: Rent a scooter ($8-10/day) or use local taxis
- **Airport Transfers**: Pre-book for best rates ($20-25 each way)`}

## Estimated Total Budget: ${calculateDynamicCost(destinations, formData).replace('$', '').replace(',', '')}

${isMultiCity ?
`This epic ${destinations.length}-city adventure is customized for your ${formData.travelStyle} travel style, with ${formData.stayType} accommodations and a focus on ${formData.activities.join(', ')}. You're going to have the most incredible time exploring ${destinationNames}!`
:
`This trip plan is customized based on your preferences for a balanced mix of activities and downtime, luxury ${formData.stayType} accommodation, and interests in ${formData.activities.join(', ')}.`}

Enjoy your ${isMultiCity ? 'multi-city adventure' : `stay in beautiful ${primaryDestination.name}`}!
    `;
  };

  // Calculate dynamic cost based on destinations and preferences
  const calculateDynamicCost = (destinations: DestinationDetail[], formData: any) => {
    let totalCost = 0;
    
    // Calculate trip duration (default to 7 days if not specified)
    let tripDuration = 7;
    if (formData.arrivalDate && formData.departureDate) {
      const arrival = new Date(formData.arrivalDate);
      const departure = new Date(formData.departureDate);
      tripDuration = Math.max(1, Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));
    }
    
    // Calculate days per city for multi-city trips
    const daysPerCity = destinations.length > 1 ? Math.max(1, Math.floor(tripDuration / destinations.length)) : tripDuration;
    
    // Calculate cost for each destination
    destinations.forEach(dest => {
      // Base daily cost based on cost of living
      let baseDailyCost = 45; // low cost
      if (dest.costOfLiving === 'medium') baseDailyCost = 75;
      if (dest.costOfLiving === 'high') baseDailyCost = 120;
      
      // Accommodation multiplier
      let accommodationMultiplier = 1.0; // airbnb default
      if (formData.stayType === 'hotel') accommodationMultiplier = 1.3;
      if (formData.stayType === 'resort') accommodationMultiplier = 1.6;
      if (formData.stayType === 'hostel') accommodationMultiplier = 0.7;
      if (formData.stayType === 'guesthouse') accommodationMultiplier = 0.9;
      
      // Activity costs
      let activityCost = 0;
      if (formData.activities.includes('Cultural / Museums')) activityCost += 15;
      if (formData.activities.includes('Nature / Outdoors')) activityCost += 20;
      if (formData.activities.includes('Food / Culinary')) activityCost += 25;
      if (formData.activities.includes('Night life')) activityCost += 30;
      if (formData.activities.includes('Shopping')) activityCost += 20;
      if (formData.activities.includes('Work / co-working')) activityCost += 10;
      
      const dailyCost = (baseDailyCost * accommodationMultiplier) + activityCost;
      totalCost += dailyCost * daysPerCity;
    });
    
    // Add transportation costs for multi-city trips
    if (destinations.length > 1) {
      totalCost += (destinations.length - 1) * 150; // Inter-city transport
    }
    
    // Add 10% buffer for miscellaneous expenses
    totalCost = Math.round(totalCost * 1.1);
    
    return `$${totalCost.toLocaleString()}`;
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

  const handleDestinationToggle = (dest: DestinationDetail) => {
    setSelectedDestinations(prev => {
      const isSelected = prev.find(d => d.id === dest.id);
      if (isSelected) {
        return prev.filter(d => d.id !== dest.id);
      } else {
        return [...prev, dest];
      }
    });
  };

  const removeDestination = (destId: string) => {
    setSelectedDestinations(prev => prev.filter(d => d.id !== destId));
  };

  const getPrimaryDestination = () => selectedDestinations[0] || destination;

  // Utility functions for destination cards
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

  // Advanced Trip Plan Display Component with animations
  const TripPlanDisplay = ({ tripPlan, selectedDestinations, tripCost }: { tripPlan: string, selectedDestinations: DestinationDetail[], tripCost: string }) => {
    const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const toggleSection = (sectionId: string) => {
      setExpandedSections(prev => 
        prev.includes(sectionId) 
          ? prev.filter(id => id !== sectionId)
          : [...prev, sectionId]
      );
    };

    const copySection = (content: string, sectionId: string) => {
      navigator.clipboard.writeText(content);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    };

    const copyFullPlan = () => {
      navigator.clipboard.writeText(tripPlan);
      setCopiedSection('full');
      setTimeout(() => setCopiedSection(null), 2000);
    };

    // Parse the trip plan into structured sections
    const parseTripPlan = (content: string) => {
      const sections = content.split(/(?=^#)/m).filter(section => section.trim());
      const parsedSections = [];

      sections.forEach((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        if (lines.length === 0) return;

        const firstLine = lines[0];
        let title = '';
        let icon = Camera;
        let sectionId = `section-${index}`;
        let color = 'text-gray-800';
        let bgColor = 'bg-gray-100';

        // Determine section type and assign appropriate icon/color
        if (firstLine.includes('Overview') || index === 0) {
          title = 'Trip Overview';
          icon = Star;
          sectionId = 'overview';
          color = 'text-blue-600';
          bgColor = 'bg-blue-100';
        } else if (firstLine.includes('Itinerary') || firstLine.includes('Days')) {
          title = 'Daily Itinerary';
          icon = Clock;
          sectionId = 'itinerary';
          color = 'text-green-600';
          bgColor = 'bg-green-100';
        } else if (firstLine.includes('Accommodation') || firstLine.includes('Hotel')) {
          title = 'Where to Stay';
          icon = Home;
          sectionId = 'accommodation';
          color = 'text-purple-600';
          bgColor = 'bg-purple-100';
        } else if (firstLine.includes('Work') || firstLine.includes('Remote')) {
          title = 'Work Setup';
          icon = Briefcase;
          sectionId = 'work';
          color = 'text-orange-600';
          bgColor = 'bg-orange-100';
        } else if (firstLine.includes('Activity') || firstLine.includes('Highlights')) {
          title = 'Activity Highlights';
          icon = Camera;
          sectionId = 'activities';
          color = 'text-pink-600';
          bgColor = 'bg-pink-100';
        } else if (firstLine.includes('Transportation') || firstLine.includes('Between Cities')) {
          title = 'Getting Around';
          icon = Plane;
          sectionId = 'transport';
          color = 'text-indigo-600';
          bgColor = 'bg-indigo-100';
        } else if (firstLine.includes('Cost') || firstLine.includes('Budget')) {
          title = 'Cost Breakdown';
          icon = DollarSign;
          sectionId = 'cost';
          color = 'text-emerald-600';
          bgColor = 'bg-emerald-100';
        } else if (firstLine.includes('Tips') || firstLine.includes('Insider')) {
          title = "Alex's Insider Tips";
          icon = Lightbulb;
          sectionId = 'tips';
          color = 'text-yellow-600';
          bgColor = 'bg-yellow-100';
        } else if (firstLine.includes('Practical') || firstLine.includes('Information')) {
          title = 'Practical Info';
          icon = Phone;
          sectionId = 'practical';
          color = 'text-gray-600';
          bgColor = 'bg-gray-100';
        } else {
          title = firstLine.replace(/^#+\s*/, '').replace(/[*#]/g, '');
          icon = Camera;
          color = 'text-gray-700';
          bgColor = 'bg-gray-100';
        }

        const content = lines.slice(1).join('\n');
        
        parsedSections.push({
          id: sectionId,
          title,
          icon,
          color,
          bgColor,
          content,
          rawContent: section
        });
      });

      return parsedSections;
    };

    const formatSectionContent = (content: string) => {
      return content.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        // Handle bullet points with better styling
        if (trimmedLine.startsWith('- ')) {
          return (
            <div key={index} className="flex items-start space-x-3 py-2 transition-all duration-300 hover:bg-gray-50 rounded-lg px-2">
              <div className="w-2 h-2 bg-[#C66E4E] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 leading-relaxed">{trimmedLine.replace('- ', '')}</p>
            </div>
          );
        }

        // Handle numbered lists
        if (/^\d+\./.test(trimmedLine)) {
          const number = trimmedLine.match(/^(\d+)\./)?.[1];
          const text = trimmedLine.replace(/^\d+\.\s*/, '');
          return (
            <div key={index} className="flex items-start space-x-3 py-2 transition-all duration-300 hover:bg-gray-50 rounded-lg px-2">
              <div className="w-6 h-6 bg-[#C66E4E] text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {number}
              </div>
              <p className="text-gray-700 leading-relaxed">{text}</p>
            </div>
          );
        }

        // Handle bold text and special formatting
        const formatText = (text: string) => {
          return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
            .replace(/🌟|✈️|��|💻|🎯|💰|💡|📱|🌴|🏰|📅|🚤|🛍️|🥭|☕|🏖️|⛲|🌊|🦐|🌅|🌿|💃|🍲|🎉|✨/g, '<span class="text-lg">$&</span>');
        };

        // Regular paragraphs
        return (
          <p 
            key={index} 
            className="text-gray-700 leading-relaxed py-1 transition-all duration-200"
            dangerouslySetInnerHTML={{ __html: formatText(trimmedLine) }}
          />
        );
      }).filter(Boolean);
    };

    const sections = parseTripPlan(tripPlan);

    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Trip Header with Animation */}
        <div className="bg-gradient-to-r from-[#C66E4E] to-[#E8956F] rounded-xl p-6 text-white transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {selectedDestinations.length > 1 ? 'Multi-City Adventure' : `${selectedDestinations[0]?.name} Journey`}
              </h1>
              <p className="text-orange-100">
                {selectedDestinations.map(d => d.name).join(' → ')} • AI-Generated Plan
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-100">Estimated Cost</div>
              <div className="text-3xl font-bold">{tripCost}</div>
            </div>
          </div>
          
          {/* Destination Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedDestinations.map((dest, index) => (
              <div 
                key={dest.id} 
                className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm transform transition-all duration-300 hover:bg-white/30"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInFromRight 0.5s ease-out forwards'
                }}
              >
                {dest.name}, {dest.country}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={copyFullPlan}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              {copiedSection === 'full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSection === 'full' ? 'Copied!' : 'Copy Full Plan'}
            </button>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            
            return (
              <div 
                key={section.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                      <IconComponent className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copySection(section.rawContent, section.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                    >
                      {copiedSection === section.id ? 
                        <Check className="w-4 h-4 text-green-600" /> : 
                        <Copy className="w-4 h-4 text-gray-500" />
                      }
                    </button>
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </button>

                {/* Section Content with Smooth Animation */}
                <div className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-4 pt-0 border-t border-gray-100">
                    <div className="space-y-3">
                      {formatSectionContent(section.content)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Footer */}
        <div className="bg-gray-50 rounded-xl p-4 transform transition-all duration-300 hover:bg-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="transform transition-all duration-200 hover:scale-110">
              <div className="text-2xl font-bold text-[#C66E4E]">{selectedDestinations.length}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="transform transition-all duration-200 hover:scale-110">
              <div className="text-2xl font-bold text-[#C66E4E]">{sections.length}</div>
              <div className="text-sm text-gray-600">Sections</div>
            </div>
            <div className="transform transition-all duration-200 hover:scale-110">
              <div className="text-2xl font-bold text-[#C66E4E]">⭐</div>
              <div className="text-sm text-gray-600">AI Generated</div>
            </div>
            <div className="transform transition-all duration-200 hover:scale-110">
              <div className="text-2xl font-bold text-[#C66E4E]">{tripCost}</div>
              <div className="text-sm text-gray-600">Budget</div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

  if (!getPrimaryDestination()) return null;

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
            {step > 1 && !showDestinations && (
              <button onClick={handlePrevious} className="mr-3">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            {showDestinations && (
              <button onClick={() => setShowDestinations(false)} className="mr-3">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <DialogTitle className="text-xl font-bold flex-1 text-gray-900">
              {showDestinations ? 'Choose Your Destinations' : 'Plan Your Trip'}
            </DialogTitle>
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
          {showDestinations ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">Destinations from Your Chat</h2>
                <p className="text-gray-600 text-sm">
                  Select multiple destinations to create a multi-city trip. Choose the destinations Alex has recommended for you.
                </p>
                
                {/* Continue Button - moved to top */}
                {selectedDestinations.length > 0 && (
                  <div className="mt-3">
                    <Button
                      onClick={() => setShowDestinations(false)}
                      className="bg-[#C66E4E] hover:bg-[#b66245] text-white text-sm px-4 py-2 h-auto"
                    >
                      Continue with {selectedDestinations.length} destination{selectedDestinations.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
                
                {selectedDestinations.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      Selected destinations ({selectedDestinations.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestinations.map(dest => (
                        <div key={dest.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-orange-300">
                          <span className="text-xs font-medium text-gray-700">{dest.name}</span>
                          <button 
                            onClick={() => removeDestination(dest.id)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {availableDestinations.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {availableDestinations.map((dest) => {
                    const isSelected = selectedDestinations.find(d => d.id === dest.id);
                    return (
                      <div
                        key={dest.id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-[#C66E4E] bg-orange-50' 
                            : 'border-gray-200 hover:border-[#C66E4E]'
                        }`}
                        onClick={() => handleDestinationToggle(dest)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img
                              src={dest.imageUrl}
                              alt={dest.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-[#C66E4E] text-white rounded-full w-5 h-5 flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {dest.country}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center">
                                <DollarSign className={`w-3 h-3 mr-1 ${getCostColor(dest.costOfLiving)}`} />
                                <span className="capitalize">{dest.costOfLiving}</span>
                              </div>
                              <div className="flex items-center">
                                <Wifi className={`w-3 h-3 mr-1 ${getInternetColor(dest.internetSpeed)}`} />
                                <span>WiFi</span>
                              </div>
                              <div className="flex items-center">
                                <Shield className="w-3 h-3 mr-1 text-green-500" />
                                <span>{dest.safetyRating}/5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No destinations available from your chat yet.</p>
                  <p className="text-sm mt-1">Start a conversation with Alex to get personalized recommendations!</p>
                </div>
              )}
            </div>
          ) : step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">
                  Trip to {selectedDestinations.length > 1 
                    ? `${selectedDestinations.length} destinations` 
                    : getPrimaryDestination()?.name}
                </h2>
                <p className="text-gray-600 text-sm">
                  {selectedDestinations.length > 1 
                    ? `Let's create a personalized multi-city itinerary for your journey through ${selectedDestinations.map(d => d.name).join(', ')}.`
                    : `Let's create a personalized itinerary for your stay in ${getPrimaryDestination()?.name.toLowerCase()}, ${getPrimaryDestination()?.country}.`}
                </p>
                
                {/* Selected Destinations Display */}
                {selectedDestinations.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Selected destinations ({selectedDestinations.length}):
                      </span>
                      <button 
                        className="text-[#C66E4E] text-sm hover:underline"
                        onClick={() => setShowDestinations(true)}
                      >
                        Edit selection
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDestinations.map(dest => (
                        <div key={dest.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-300">
                          <span className="text-xs font-medium text-gray-700">{dest.name}, {dest.country}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {availableDestinations.length > 0 && (
                  <button 
                    className="flex items-center text-[#C66E4E] text-sm mt-3 hover:underline"
                    onClick={() => setShowDestinations(true)}
                  >
                  <span className="mr-2 text-[#C66E4E] font-bold">⊕</span> 
                    {selectedDestinations.length > 1 ? 'Modify destinations' : `More locations from chat (${availableDestinations.length})`}
                </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Arrival and Departure Dates with Date Picker */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Arrival Date</label>
                    <Popover open={arrivalOpen} onOpenChange={setArrivalOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !arrivalDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {arrivalDate ? format(arrivalDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={arrivalDate}
                          onSelect={(date) => {
                            setArrivalDate(date);
                            setFormData({...formData, arrivalDate: date ? format(date, "yyyy-MM-dd") : ''});
                            setArrivalOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Departure Date</label>
                    <Popover open={departureOpen} onOpenChange={setDepartureOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !departureDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departureDate ? format(departureDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={departureDate}
                          onSelect={(date) => {
                            setDepartureDate(date);
                            setFormData({...formData, departureDate: date ? format(date, "yyyy-MM-dd") : ''});
                            setDepartureOpen(false);
                          }}
                          disabled={(date) => arrivalDate ? date <= arrivalDate : date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Budget with Custom Option */}
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Budget</label>
                  <div className="space-y-3">
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E] appearance-none bg-white"
                      value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value, customBudget: ''})}
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
                    
                    {formData.budget === 'custom' && (
                      <div>
                        <Input
                          type="text"
                          placeholder="Enter your budget (e.g., $3,000)"
                          className="w-full border border-gray-300 rounded py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C66E4E]/20 focus:border-[#C66E4E]"
                          value={formData.customBudget}
                          onChange={(e) => setFormData({...formData, customBudget: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-1">Please include currency symbol (e.g., $3,000, €2,500, £2,000)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && !showDestinations && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 text-gray-900">Travel Preference</h2>
                <p className="text-gray-600 text-sm">
                  Tell us about your travel style and preferences for your {selectedDestinations.length > 1 ? 'multi-city journey' : 'trip'}.
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
                    placeholder={selectedDestinations.length > 1 ? "Any special requests for your multi-city trip..." : "Any special requests or preferences..."}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && !showDestinations && (
            loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C66E4E] mb-4"></div>
                <p className="text-gray-600">Alex is crafting your perfect trip plan...</p>
                <p className="text-sm text-gray-500 mt-2">This might take a moment ✨</p>
                </div>
            ) : tripPlan ? (
              <TripPlanDisplay tripPlan={tripPlan} selectedDestinations={selectedDestinations} tripCost={tripCost} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Your trip plan will appear here...</p>
                  </div>
            )
          )}
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 pt-2 mt-auto flex-shrink-0">
          <div className="flex gap-4">
            {step === 3 && !showDestinations ? (
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-300 text-gray-700"
              >
                Close
              </Button>
            ) : !showDestinations ? (
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
                  disabled={loading || (step === 1 && selectedDestinations.length === 0)}
                  className="flex-1 bg-[#C66E4E] hover:bg-[#b66245] text-white"
                >
                  {step === 2 ? (loading ? 'Generating...' : 'Done') : 'Next'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Update the demo component to include sample destinations
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

  const sampleDestinations: DestinationDetail[] = [
    sampleDestination,
    {
      id: "2",
      name: "Goa",
      country: "India",
      imageUrl: "/sample-destination-2.jpg",
      description: "Beach paradise for digital nomads",
      costOfLiving: "low",
      internetSpeed: "fast",
      visaRequirements: "Easy",
      safetyRating: 4
    },
    {
      id: "3",
      name: "Mumbai",
      country: "India",
      imageUrl: "/sample-destination-3.jpg",
      description: "Bustling metropolitan city",
      costOfLiving: "medium",
      internetSpeed: "fast",
      visaRequirements: "Easy",
      safetyRating: 4
    }
  ];

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
        availableDestinations={sampleDestinations}
      />
    </div>
  );
};

export default TripPlanningModal;