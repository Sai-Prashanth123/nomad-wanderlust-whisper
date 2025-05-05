import { Destination } from "../components/DestinationCard";

export const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Chiang Mai",
    country: "Thailand",
    imageUrl: "https://images.unsplash.com/photo-1598935888738-cd2a3a5e152f?q=80&w=2670&auto=format&fit=crop",
    description: "Known as the digital nomad capital of Southeast Asia, Chiang Mai offers an exceptional balance of affordability, quality of life, and vibrant culture. Its laid-back atmosphere, abundance of coworking spaces, and strong nomad community make it ideal for remote workers.",
    costOfLiving: "low",
    internetSpeed: "fast",
    visaRequirements: "moderate",
    climate: "tropical",
    bestTimeToVisit: ["Nov", "Dec", "Jan", "Feb", "Mar"],
    nomadCommunity: "large",
    safetyRating: 4,
    monthlyRent: "$300-600",
    coworkingSpaces: 15
  },
  {
    id: "2",
    name: "Lisbon",
    country: "Portugal",
    imageUrl: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?q=80&w=2574&auto=format&fit=crop",
    description: "With its beautiful coastal setting, historic charm, and vibrant culture, Lisbon has quickly become a European hub for digital nomads. It offers great weather, delicious food, and reasonable living costs compared to other Western European capitals.",
    costOfLiving: "medium",
    internetSpeed: "fast",
    visaRequirements: "easy",
    climate: "temperate",
    bestTimeToVisit: ["Apr", "May", "Jun", "Sep", "Oct"],
    nomadCommunity: "large",
    safetyRating: 5,
    monthlyRent: "$700-1200",
    coworkingSpaces: 20
  },
  {
    id: "3",
    name: "Bali",
    country: "Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1573790387438-4da905039392?q=80&w=2025&auto=format&fit=crop",
    description: "This tropical paradise has evolved into a major digital nomad destination, especially around Canggu and Ubud. Bali offers a relaxed lifestyle, stunning beaches, rich culture, and a large community of like-minded remote workers.",
    costOfLiving: "low",
    internetSpeed: "medium",
    visaRequirements: "moderate",
    climate: "tropical",
    bestTimeToVisit: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    nomadCommunity: "large",
    safetyRating: 4,
    monthlyRent: "$400-800",
    coworkingSpaces: 25
  },
  {
    id: "4",
    name: "Medellín",
    country: "Colombia",
    imageUrl: "https://images.unsplash.com/photo-1630513725002-9f6fc1af1117?q=80&w=2574&auto=format&fit=crop",
    description: "Once notorious, Medellín has transformed into a modern, innovative city popular with digital nomads. Known as the 'City of Eternal Spring' for its ideal climate, it offers affordable living, good infrastructure, and a growing tech scene.",
    costOfLiving: "low",
    internetSpeed: "medium",
    visaRequirements: "easy",
    climate: "temperate",
    bestTimeToVisit: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    nomadCommunity: "growing",
    safetyRating: 3,
    monthlyRent: "$400-700",
    coworkingSpaces: 12
  },
  {
    id: "5",
    name: "Budapest",
    country: "Hungary",
    imageUrl: "https://images.unsplash.com/photo-1551867633-194f125bddfa?q=80&w=2574&auto=format&fit=crop",
    description: "Budapest offers incredible value for digital nomads seeking European charm without Western European prices. Split by the Danube River, the city boasts stunning architecture, thermal baths, vibrant nightlife, and a convenient location for exploring Europe.",
    costOfLiving: "medium",
    internetSpeed: "fast",
    visaRequirements: "moderate",
    climate: "continental",
    bestTimeToVisit: ["Apr", "May", "Jun", "Sep", "Oct"],
    nomadCommunity: "growing",
    safetyRating: 4,
    monthlyRent: "$500-800",
    coworkingSpaces: 15
  },
  {
    id: "6",
    name: "Mexico City",
    country: "Mexico",
    imageUrl: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?q=80&w=2670&auto=format&fit=crop",
    description: "Mexico City offers a perfect blend of ancient culture and modern amenities for digital nomads. With its vibrant arts scene, incredible food, and large expat community, the city provides an exciting base with easy access to both coasts and natural wonders.",
    costOfLiving: "low",
    internetSpeed: "medium",
    visaRequirements: "easy",
    climate: "temperate",
    bestTimeToVisit: ["Jan", "Feb", "Mar", "Nov", "Dec"],
    nomadCommunity: "large",
    safetyRating: 3,
    monthlyRent: "$500-900",
    coworkingSpaces: 30
  }
];

// Function to get suggested destinations based on a user query
export const getSuggestedDestinations = (query: string): Destination[] => {
  const lowercaseQuery = query.toLowerCase();
  
  // Keywords to match with destinations
  if (lowercaseQuery.includes('beach') || lowercaseQuery.includes('tropical')) {
    return mockDestinations.filter(dest => dest.climate === 'tropical');
  }
  
  if (lowercaseQuery.includes('cheap') || lowercaseQuery.includes('affordable')) {
    return mockDestinations.filter(dest => dest.costOfLiving === 'low');
  }
  
  if (lowercaseQuery.includes('europe')) {
    return mockDestinations.filter(dest => 
      dest.country === 'Portugal' || dest.country === 'Hungary');
  }
  
  if (lowercaseQuery.includes('asia')) {
    return mockDestinations.filter(dest => 
      dest.country === 'Thailand' || dest.country === 'Indonesia');
  }
  
  if (lowercaseQuery.includes('fast wifi') || lowercaseQuery.includes('good internet')) {
    return mockDestinations.filter(dest => dest.internetSpeed === 'fast');
  }
  
  if (lowercaseQuery.includes('visa') || lowercaseQuery.includes('easy visa')) {
    return mockDestinations.filter(dest => dest.visaRequirements === 'easy');
  }
  
  // Default: return top 3 most popular
  return mockDestinations.slice(0, 3);
};

// Function to get destinations by specific query
export const getDestinationsByQuery = (query: string): Destination[] => {
  const lowercaseQuery = query.toLowerCase();
  
  return mockDestinations.filter(
    dest => 
      dest.name.toLowerCase().includes(lowercaseQuery) || 
      dest.country.toLowerCase().includes(lowercaseQuery)
  );
};
