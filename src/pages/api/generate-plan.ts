import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface PlanningRequest {
  destination: {
    id: string;
    name: string;
    country: string;
    description: string;
    costOfLiving: string;
    internetSpeed: string;
    visaRequirements: string;
    climate?: string;
    bestTimeToVisit?: string[];
    nomadCommunity?: string;
    safetyRating: number;
    monthlyRent?: string;
    coworkingSpaces?: number;
    localFunFact?: string;
    coworkingCafes?: string[];
    simTip?: string;
    wifiDetails?: string;
    visaTip?: string;
    insiderTip?: string;
    weatherWatch?: string;
  };
  arrivalDate: string;
  departureDate: string;
  budget: string;
  travelStyle: string;
  stayType: string;
  activities: string[];
  workRemotely: boolean;
  notes?: string;
  session_id?: string;
}

interface TravelPlanResponse {
  plan: string;
  session_id?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const planningRequest = req.body as PlanningRequest;
    
    // Call our FastAPI backend
    const response = await axios.post<TravelPlanResponse>(
      'http://localhost:8000/generate-plan',
      planningRequest
    );
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error generating travel plan:', error);
    
    // Fallback to generate a plan using our mock implementation
    const planningRequest = req.body as PlanningRequest;
    const mockPlan = generateMockPlan(planningRequest);
    
    return res.status(200).json({ 
      plan: mockPlan,
      session_id: planningRequest.session_id || 'mock-session'
    });
  }
}

// Fallback function to generate a mock travel plan if the API call fails
function generateMockPlan(request: PlanningRequest): string {
  const { destination, arrivalDate, departureDate, budget, travelStyle, stayType, activities, workRemotely } = request;
  
  // Calculate estimated trip length
  let tripLength = 4; // default
  if (arrivalDate && departureDate) {
    const startDate = new Date(arrivalDate);
    const endDate = new Date(departureDate);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      tripLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }
  
  // Calculate budget range based on selection
  let budgetAmount = "$200";
  switch (budget) {
    case "under-500":
      budgetAmount = "$" + (tripLength * 50);
      break;
    case "500-1000":
      budgetAmount = "$" + (tripLength * 100);
      break;
    case "1000-2500":
      budgetAmount = "$" + (tripLength * 200);
      break;
    case "2500-5000":
      budgetAmount = "$" + (tripLength * 400);
      break;
    case "5000-plus":
      budgetAmount = "$" + (tripLength * 800);
      break;
    default:
      budgetAmount = "$" + (tripLength * 100);
  }
  
  // Generate different activity suggestions based on selected activities
  const activitySuggestions = [];
  if (activities.includes("Cultural / Museums")) {
    activitySuggestions.push("Visit local museums and historical sites");
  }
  if (activities.includes("Nature / Outdoors")) {
    activitySuggestions.push("Explore nearby nature trails and beaches");
  }
  if (activities.includes("Food / Culinary")) {
    activitySuggestions.push("Try local cuisine at authentic restaurants");
  }
  if (activities.includes("Night life")) {
    activitySuggestions.push("Experience the vibrant nightlife scene");
  }
  if (activities.includes("Shopping")) {
    activitySuggestions.push("Shop at local markets and boutiques");
  }
  if (activities.includes("Work / co-working")) {
    activitySuggestions.push("Set up at coworking spaces with reliable internet");
  }
  
  return `
# ${destination.name} Travel Itinerary

## Overview

Hey hey! 🌴 So, you're heading to ${destination.name}, ${destination.country}—what a vibe! This quaint little coastal gem in ${destination.country} is perfect for a ${travelStyle} mix of ${activities.join(', ')}. With its ${destination.climate || 'pleasant'} climate, ${destination.description.toLowerCase()}, ${destination.name} is where you can ${workRemotely ? 'hustle remotely by day and soak in the local culture by night' : 'fully immerse yourself in the local culture'}.

## Digital Nomad Setup

${workRemotely ? `Okay, let's talk work mode first. The internet in ${destination.name} is ${destination.internetSpeed}, so here's what you need to know:

- **Best Coworking Spaces**: Check out ${destination.coworkingCafes?.slice(0,2).join(' and ') || "local cafés"} for decent WiFi and good vibes
- **Backup Internet**: ${destination.simTip || "Grab a local SIM card as soon as you land"}
- **Power Situation**: Carry adapters and power banks for backup
- **Best Work-Friendly Cafés**: ${destination.coworkingCafes?.[2] || "Local cafés"} offers great ambiance for working` : `Even though you're not planning to work during your trip, it's good to know that ${destination.name} has ${destination.internetSpeed} internet if you need to stay connected.`}

## Day 1: Arrival & Settling In

- **Morning**: Airport pickup, check-in at your ${stayType}
- **Afternoon**: Light exploration of the neighborhood, pick up essentials
- **Evening**: ${activities.includes('Food / Culinary') ? 'Authentic local dinner experience' : 'Relaxing dinner at your accommodation'}
- **Cost**: ~$60 (including transport from airport)

## Day 2: ${activities.includes('Cultural / Museums') ? 'Cultural Exploration' : 'Local Orientation'}

- **Morning**: ${activities.includes('Cultural / Museums') ? 'Visit top cultural attractions' : 'Explore the local neighborhood'}
- **Afternoon**: ${activities.includes('Food / Culinary') ? 'Food tour of local specialties' : 'Relax and enjoy local cuisine'}
- **Evening**: ${activities.includes('Night life') ? 'Experience local nightlife' : 'Quiet evening to recharge'}
- **Cost**: ~$40-80

## Day 3: ${activities.includes('Nature / Outdoors') ? 'Nature Adventure' : 'Relaxation Day'}

- **Morning**: ${activities.includes('Nature / Outdoors') ? 'Nature excursion to nearby attractions' : 'Leisurely breakfast and relaxation'}
- **Afternoon**: ${activities.includes('Shopping') ? 'Shopping at local markets' : 'Continue exploration at your own pace'}
- **Evening**: ${activities.includes('Food / Culinary') ? 'Dinner at a highly-rated local restaurant' : 'Casual dinner'}
- **Cost**: ~$35-75

${tripLength > 3 ? `## Day 4: ${activities.includes('Work / co-working') ? 'Remote Work & Exploration' : 'Deeper Immersion'}

- **Morning**: ${activities.includes('Work / co-working') ? 'Work session at recommended coworking space' : 'Visit off-the-beaten-path attractions'}
- **Afternoon**: ${activities.includes('Nature / Outdoors') ? 'Beach or nature activity' : 'Continue cultural exploration'}
- **Evening**: ${activities.includes('Night life') ? 'Evening entertainment' : 'Relaxing dinner'}
- **Cost**: ~$40-90` : ''}

## Accommodation Recommendations

Based on your preference for ${stayType}:
- **Luxury Option**: Premium ${stayType.charAt(0).toUpperCase() + stayType.slice(1)} with amenities ($${Math.round(parseInt(destination.monthlyRent?.replace(/\$|\-.*$/g, '') || '600') / 30)}-${Math.round(parseInt(destination.monthlyRent?.replace(/\$|\-.*$/g, '') || '600') / 20)}/night)
- **Mid-range Option**: Comfortable ${stayType} with good value ($${Math.round(parseInt(destination.monthlyRent?.replace(/\$|\-.*$/g, '') || '600') / 45)}-${Math.round(parseInt(destination.monthlyRent?.replace(/\$|\-.*$/g, '') || '600') / 30)}/night)
- **Budget Option**: Basic but clean ${stayType} ($${Math.round(parseInt(destination.monthlyRent?.replace(/\$|\-.*$/g, '') || '600') / 60)}-${Math.round(parseInt(destination.monthlyRent?.replace(/\$|\-.*$/g, '') || '600') / 45)}/night)

## Transportation

- **Getting Around**: ${destination.country === 'Thailand' || destination.country === 'Indonesia' ? 'Rent a scooter ($8-10/day) or use local taxis' : 'Public transportation, taxis, or walking'}
- **Airport Transfers**: Pre-book for best rates ($20-30 each way)

## Estimated Total Budget: ${budgetAmount}

This trip plan is customized based on your preferences for a ${travelStyle} experience, ${stayType} accommodation, and interests in ${activities.join(', ')}.

${destination.insiderTip ? `## Insider Tip: ${destination.insiderTip}` : ''}

Enjoy your stay in beautiful ${destination.name}!
  `;
} 