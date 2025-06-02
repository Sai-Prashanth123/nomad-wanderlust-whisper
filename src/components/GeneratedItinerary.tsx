import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Coffee, 
  Wifi, 
  Sun, 
  Home, 
  Download, 
  Share2, 
  Edit,
  ChevronDown,
  CheckCircle,
  Briefcase,
  Users
} from 'lucide-react';
import { ItineraryFormData } from './TrailPlannerForm';
import { Destination } from './DestinationCard';
import { motion } from 'framer-motion';

interface GeneratedItineraryProps {
  formData: ItineraryFormData;
  destination: Destination;
  onBack: () => void;
  itineraryData?: {
    introduction: string;
    activities: Array<{
      title: string;
      description: string;
      days: string;
      icon: string;
    }>;
    monthlyHighlights: string[];
    accommodationRecs: string;
  };
}

export const GeneratedItinerary: React.FC<GeneratedItineraryProps> = ({
  formData,
  destination,
  onBack,
  itineraryData
}) => {
  // Calculate some derived data from the form
  const dayCount = formData.stayDuration;
  const hasRemoteWork = formData.workRemotely;
  const isLongStay = dayCount >= 30;
  
  // Example activities for the itinerary
  const generateActivities = () => {
    // If we have itinerary data from API, use it
    if (itineraryData?.activities) {
      return itineraryData.activities.map(activity => {
        // Map icon names to actual icon components
        let iconComponent;
        switch(activity.icon) {
          case 'home':
            iconComponent = <Home className="h-5 w-5 text-blue-400" />;
            break;
          case 'wifi':
            iconComponent = <Wifi className="h-5 w-5 text-purple-400" />;
            break;
          case 'coffee':
            iconComponent = <Coffee className="h-5 w-5 text-yellow-400" />;
            break;
          case 'sun':
            iconComponent = <Sun className="h-5 w-5 text-green-400" />;
            break;
          case 'briefcase':
            iconComponent = <Briefcase className="h-5 w-5 text-orange-400" />;
            break;
          case 'map':
            iconComponent = <MapPin className="h-5 w-5 text-red-400" />;
            break;
          default:
            iconComponent = <MapPin className="h-5 w-5 text-red-400" />;
        }
        
        return {
          ...activity,
          icon: iconComponent
        };
      });
    }
    
    // Fallback to generating static activities if no API data
    const baseActivities = [
      { 
        title: 'Arrival & Settling In',
        description: `Check into your ${formData.accommodationType} and explore your neighborhood. Find essential amenities like grocery stores and public transportation.`,
        days: '1-2',
        icon: <Home className="h-5 w-5 text-blue-400" />
      },
      { 
        title: 'Essential Nomad Setup',
        description: hasRemoteWork ? 'Visit recommended coworking spaces: CAMP, Punspace, and Yellow. Test internet speeds and establish your remote work routine.' : 'Locate the best cafés with good wifi for casual work sessions.',
        days: '3-4',
        icon: <Wifi className="h-5 w-5 text-purple-400" />
      },
      { 
        title: 'Cultural Immersion',
        description: 'Visit the Old City temples, including Wat Phra Singh and Wat Chedi Luang. Experience a traditional Khantoke dinner with dance performances.',
        days: '5-7',
        icon: <MapPin className="h-5 w-5 text-red-400" />
      }
    ];
    
    // Add specialized activities based on interests
    const specializedActivities = [];
    if (formData.interests.includes('Food')) {
      specializedActivities.push({
        title: 'Culinary Adventures', 
        description: 'Take a Thai cooking class, explore the night markets for street food, and discover hidden local restaurants.',
        days: 'Ongoing',
        icon: <Coffee className="h-5 w-5 text-yellow-400" />
      });
    }
    
    if (formData.interests.includes('Nature')) {
      specializedActivities.push({
        title: 'Nature Excursions', 
        description: 'Day trips to Doi Inthanon National Park, Sticky Waterfall, and elephant sanctuaries in the surrounding mountains.',
        days: 'Weekends',
        icon: <Sun className="h-5 w-5 text-green-400" />
      });
    }
    
    if (hasRemoteWork) {
      specializedActivities.push({
        title: 'Nomad Community Events', 
        description: 'Join weekly nomad meetups, entrepreneurship talks, and skill-sharing workshops in the digital nomad community.',
        days: 'Weekly',
        icon: <Briefcase className="h-5 w-5 text-orange-400" />
      });
    }
    
    return [...baseActivities, ...specializedActivities];
  };
  
  const activities = generateActivities();
  
  // Example monthly highlights or use from API
  const monthlyHighlights = itineraryData?.monthlyHighlights || [
    'Sunday Walking Street Market (every Sunday)',
    'Chiang Mai Design Week (if visiting December)',
    'Loy Krathong / Yi Peng Festival (if visiting November)',
    'Songkran Water Festival (if visiting April)',
    'Nomad Coffee Club Meetups (every Tuesday)',
    'Tech Entrepreneurs Networking (bi-weekly)',
  ];
  
  // Accommodation recommendations based on form data or from API
  const getAccommodationRecs = () => {
    if (itineraryData?.accommodationRecs) {
      return itineraryData.accommodationRecs;
    }
    
    switch(formData.accommodationType) {
      case 'apartment':
        return 'Long-term rentals in Nimman area or Santitham for best value. Expect to pay 10,000-15,000 THB/month for a modern 1-bedroom.';
      case 'coliving':
        return 'Hub53, Yellow, and Draper Startup House offer coliving with built-in community and workspace.';
      case 'hostel':
        return 'Hostel by Bed, Stamps Backpackers, and Bodega Chiang Mai are popular among social travelers.';
      case 'hotel':
        return 'Akyra Manor, Le Méridien, and Anantara for luxury stays. The Nimman area has many boutique hotels.';
      default:
        return 'Numerous Airbnb options available throughout the city with good monthly discounts.';
    }
  };
  
  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Your {dayCount}-Day {destination.name} Adventure
            </h2>
            <p className="text-gray-600 mt-2">
              Personalized itinerary based on your preferences
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack} className="text-gray-600 border-gray-200">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button className="bg-[#C66E4F] hover:bg-[#B85E34] text-white">
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        
        {/* Key details */}
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
            <Calendar className="h-4 w-4 text-[#C66E4F] mr-2" />
            <span className="text-gray-900 text-sm">
              {dayCount} days ({isLongStay ? `${Math.floor(dayCount/30)} month${Math.floor(dayCount/30) > 1 ? 's' : ''}` : `${Math.ceil(dayCount/7)} week${Math.ceil(dayCount/7) > 1 ? 's' : ''}`})
            </span>
          </div>
          
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
            <Users className="h-4 w-4 text-[#C66E4F] mr-2" />
            <span className="text-gray-900 text-sm">
              {formData.travelers} traveler{formData.travelers > 1 ? 's' : ''}
            </span>
          </div>
          
          {hasRemoteWork && (
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
              <Wifi className="h-4 w-4 text-[#C66E4F] mr-2" />
              <span className="text-gray-900 text-sm">Remote work setup</span>
            </div>
          )}
          
          <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
            <Home className="h-4 w-4 text-[#C66E4F] mr-2" />
            <span className="text-gray-900 text-sm">{formData.accommodationType}</span>
          </div>
        </div>
      </div>
      
      {/* Main itinerary content */}
      <div className="space-y-8">
        {/* Introduction */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Your {destination.name} Experience</h3>
          <p className="text-gray-600">
            {itineraryData?.introduction || 
              `This ${dayCount}-day itinerary is customized for ${formData.travelers > 1 ? 'you and your companions' : 'you'} 
              based on your interests in ${formData.interests.slice(0, 3).join(', ')}
              ${formData.interests.length > 3 ? `, and more` : ''}.
              ${hasRemoteWork ? ` We've balanced productivity with exploration, ensuring you'll find excellent workspaces while experiencing the best of ${destination.name}.` : ` We've focused on immersive experiences to help you make the most of your stay.`}`
            }
          </p>
        </div>
        
        {/* Activity Timeline */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Journey</h3>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <Card key={index} className="bg-white border-gray-200 p-4">
                <div className="flex">
                  <div className="mr-4 mt-1">
                    {activity.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <span className="ml-3 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                        Day {activity.days}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Monthly Highlights */}
        {isLongStay && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Highlights</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2">
                {monthlyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-[#C66E4F] mr-2 mt-1" />
                    <span className="text-gray-600">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Accommodation Recommendations */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Where to Stay</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">
              {getAccommodationRecs()}
            </p>
          </div>
        </div>
        
        {/* Special Note */}
        {formData.specialRequests && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Special Arrangements</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">
                Based on your request: "{formData.specialRequests}", we've included appropriate recommendations in your itinerary.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 