import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Users, Briefcase, Heart, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Destination } from './DestinationCard';

interface TrailPlannerFormProps {
  destination: Destination;
  onClose: () => void;
  onSubmit: (formData: ItineraryFormData) => void;
}

export interface ItineraryFormData {
  arrivalDate: string;
  departureDate: string;
  stayDuration: number;
  travelers: number;
  budget: string;
  interests: string[];
  workRemotely: boolean;
  accommodationType: string;
  specialRequests: string;
}

export const TrailPlannerForm: React.FC<TrailPlannerFormProps> = ({ 
  destination, 
  onClose,
  onSubmit 
}) => {
  const [formData, setFormData] = useState<ItineraryFormData>({
    arrivalDate: '',
    departureDate: '',
    stayDuration: 30, // Default to 1 month
    travelers: 1,
    budget: 'medium',
    interests: [],
    workRemotely: true,
    accommodationType: 'apartment',
    specialRequests: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const currentInterests = [...prev.interests];
      if (currentInterests.includes(interest)) {
        return { ...prev, interests: currentInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...currentInterests, interest] };
      }
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const interestOptions = [
    'Culture', 'Food', 'Nature', 'Adventure', 'History', 
    'Photography', 'Art', 'Shopping', 'Nightlife', 'Wellness'
  ];

  return (
    <motion.div
      className="bg-black/80 rounded-lg border border-gray-800 p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Plan Your Trip to {destination.name}
        </h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-400">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-white">When are you arriving?</Label>
            <div className="flex items-center bg-gray-900 rounded-md p-2 border border-gray-700">
              <Calendar className="text-purple-400 mr-2 h-5 w-5" />
              <Input 
                type="date" 
                name="arrivalDate"
                value={formData.arrivalDate}
                onChange={handleInputChange}
                className="bg-transparent border-0 text-white focus:ring-0 w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-white">When are you departing?</Label>
            <div className="flex items-center bg-gray-900 rounded-md p-2 border border-gray-700">
              <Calendar className="text-purple-400 mr-2 h-5 w-5" />
              <Input 
                type="date" 
                name="departureDate"
                value={formData.departureDate}
                onChange={handleInputChange}
                className="bg-transparent border-0 text-white focus:ring-0 w-full" 
              />
            </div>
          </div>
        </div>

        {/* Stay Duration */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-white">Stay Duration</Label>
            <span className="text-purple-400 font-medium">{formData.stayDuration} days</span>
          </div>
          <Slider
            defaultValue={[30]}
            max={90}
            min={7}
            step={1}
            onValueChange={(values) => setFormData(prev => ({ ...prev, stayDuration: values[0] }))}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 week</span>
            <span>3 months</span>
          </div>
        </div>

        {/* Travel Group & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-white">Number of Travelers</Label>
            <div className="flex items-center bg-gray-900 rounded-md p-2 border border-gray-700">
              <Users className="text-purple-400 mr-2 h-5 w-5" />
              <Input 
                type="number" 
                name="travelers"
                value={formData.travelers}
                onChange={handleInputChange}
                min={1}
                max={10}
                className="bg-transparent border-0 text-white focus:ring-0 w-full" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-white">Budget Range</Label>
            <Select 
              value={formData.budget}
              onValueChange={(value) => handleSelectChange('budget', value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                <SelectItem value="low">Budget Friendly</SelectItem>
                <SelectItem value="medium">Moderate</SelectItem>
                <SelectItem value="high">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-3">
          <Label className="text-white">What are you interested in?</Label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(interest => (
              <Button
                key={interest}
                type="button"
                variant={formData.interests.includes(interest) ? "default" : "outline"}
                className={formData.interests.includes(interest) 
                  ? "bg-purple-600 hover:bg-purple-700 border-purple-400" 
                  : "bg-gray-900 hover:bg-gray-800 border-gray-700 text-gray-300"}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Remote Work */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="workRemotely" 
            checked={formData.workRemotely}
            onCheckedChange={(checked) => handleCheckboxChange('workRemotely', checked as boolean)}
          />
          <Label htmlFor="workRemotely" className="text-white cursor-pointer">
            I plan to work remotely during my stay
          </Label>
        </div>

        {/* Accommodation */}
        <div className="space-y-3">
          <Label className="text-white">Preferred Accommodation</Label>
          <Select 
            value={formData.accommodationType}
            onValueChange={(value) => handleSelectChange('accommodationType', value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Select accommodation type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="coliving">Co-living Space</SelectItem>
              <SelectItem value="airbnb">Airbnb / Vacation Rental</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Special Requests */}
        <div className="space-y-3">
          <Label className="text-white">Special Requests or Notes</Label>
          <Textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            placeholder="Any specific needs or requests for your trip?"
            className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-md font-medium"
          >
            <Save className="mr-2 h-5 w-5" />
            Generate My Personalized Itinerary
          </Button>
        </div>
      </form>
    </motion.div>
  );
}; 