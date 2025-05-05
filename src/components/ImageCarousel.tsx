import { useEffect, useState } from 'react';

// Define travel image URLs with relevant descriptions
const travelImages = [
  { 
    url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format",
    description: "Paradise beach with crystal clear water" 
  },
  { 
    url: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?q=80&w=1200&auto=format",
    description: "Mountain range with snow-capped peaks" 
  },
  { 
    url: "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=1200&auto=format",
    description: "Desert adventure with stunning dunes" 
  },
  { 
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format",
    description: "Lush tropical rainforest with waterfalls" 
  },
  { 
    url: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=1200&auto=format",
    description: "Hot air balloon over scenic landscapes" 
  },
  { 
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format",
    description: "Majestic cliff overlooking calm ocean" 
  },
  { 
    url: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format",
    description: "Remote island paradise" 
  },
  { 
    url: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?q=80&w=1200&auto=format",
    description: "Wanderlust-inspiring panoramic vista" 
  }
];

interface ImageCarouselProps {
  autoScroll?: boolean;
  className?: string;
}

const ImageCarousel = ({ autoScroll = true, className = "" }: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoScroll) return;
    
    // Auto scroll to next image every 5 seconds
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % travelImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoScroll]);

  return (
    <div className={`relative overflow-hidden h-full w-full ${className}`}>
      {/* Background Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 blur-md opacity-80 scale-110"
        style={{ backgroundImage: `url(${travelImages[activeIndex].url})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      {/* Image Slider Row - Top */}
      <div className="absolute top-[10%] w-[200%] flex overflow-hidden z-20">
        <div className="flex animate-slide-left">
          {travelImages.map((image, index) => (
            <div key={`top-${index}`} className="min-w-[300px] h-[200px] mx-2">
              <img 
                src={image.url} 
                alt={image.description}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
          {/* Duplicate the images for seamless looping */}
          {travelImages.map((image, index) => (
            <div key={`top-duplicate-${index}`} className="min-w-[300px] h-[200px] mx-2">
              <img 
                src={image.url} 
                alt={image.description}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Image Slider Row - Middle */}
      <div className="absolute top-[50%] w-[200%] flex overflow-hidden z-20">
        <div className="flex animate-slide-right" style={{ animationDelay: "2.5s" }}>
          {travelImages.map((image, index) => (
            <div key={`middle-${index}`} className="min-w-[300px] h-[200px] mx-2">
              <img 
                src={image.url} 
                alt={image.description}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
          {/* Duplicate the images for seamless looping */}
          {travelImages.map((image, index) => (
            <div key={`middle-duplicate-${index}`} className="min-w-[300px] h-[200px] mx-2">
              <img 
                src={image.url} 
                alt={image.description}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Image Slider Row - Bottom */}
      <div className="absolute bottom-[10%] w-[200%] flex overflow-hidden z-20">
        <div className="flex animate-slide-left" style={{ animationDelay: "1s" }}>
          {travelImages.map((image, index) => (
            <div key={`bottom-${index}`} className="min-w-[300px] h-[200px] mx-2">
              <img 
                src={image.url} 
                alt={image.description}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
          {/* Duplicate the images for seamless looping */}
          {travelImages.map((image, index) => (
            <div key={`bottom-duplicate-${index}`} className="min-w-[300px] h-[200px] mx-2">
              <img 
                src={image.url} 
                alt={image.description}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        {/* Content goes here */}
      </div>
    </div>
  );
};

export default ImageCarousel; 