import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Map, Calendar, Compass, Briefcase, Coffee, Sun, Star, Sparkles, BookOpen, Wifi } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TravelPlanDay {
  title: string;
  description: string;
  activities: string[];
}

interface TravelPlanData {
  destination: string;
  dates: string;
  overview: string;
  digitalNomadSetup?: string;
  days: TravelPlanDay[];
}

interface TravelPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planData: TravelPlanData;
}

const TravelPlanModal: React.FC<TravelPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  planData 
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'itinerary' | 'digitalNomad'>('overview');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll progress for animations
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollTop / scrollHeight;
    setScrollProgress(progress);
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  // Enhanced animations for UI elements
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.165, 0.84, 0.44, 1]
      }
    })
  };

  const tabVariants = {
    inactive: { opacity: 0.5, y: 0 },
    active: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#0c1426] rounded-xl border border-indigo-900/30 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
            <div className="relative h-full">
              {/* Close button with glow effect */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg transition-all duration-300 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
              >
                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              
              {/* Header with glass effect */}
              <motion.div 
                className="relative p-8 border-b border-indigo-500/20 backdrop-blur-md"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div className="relative z-10">
                  <div className="flex items-center mb-1">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="mr-2"
                    >
                      <Sparkles className="h-5 w-5 text-indigo-400" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      Your Travel Plan
                    </h1>
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-white mb-1">
                    Your {planData.destination} Travel Plan
                  </h2>
                  
                  <motion.div 
                    className="flex items-center text-indigo-300 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Clock className="h-4 w-4 mr-2 inline text-indigo-400" />
                    Plan generated with AI based on your preferences
                  </motion.div>
                </motion.div>
                
                {/* Navigation tabs */}
                <div className="flex mt-6 space-x-1">
                  <motion.button
                    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${activeSection === 'overview' ? 'bg-indigo-500/20 text-white' : 'text-indigo-300 hover:bg-white/5'}`}
                    onClick={() => setActiveSection('overview')}
                    variants={tabVariants}
                    initial="inactive"
                    animate={activeSection === 'overview' ? 'active' : 'inactive'}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Overview
                  </motion.button>
                  
                  <motion.button
                    className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${activeSection === 'itinerary' ? 'bg-indigo-500/20 text-white' : 'text-indigo-300 hover:bg-white/5'}`}
                    onClick={() => setActiveSection('itinerary')}
                    variants={tabVariants}
                    initial="inactive"
                    animate={activeSection === 'itinerary' ? 'active' : 'inactive'}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Itinerary
                  </motion.button>
                  
                  {planData.digitalNomadSetup && (
                    <motion.button
                      className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${activeSection === 'digitalNomad' ? 'bg-indigo-500/20 text-white' : 'text-indigo-300 hover:bg-white/5'}`}
                      onClick={() => setActiveSection('digitalNomad')}
                      variants={tabVariants}
                      initial="inactive"
                      animate={activeSection === 'digitalNomad' ? 'active' : 'inactive'}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Digital Nomad Setup
                    </motion.button>
                  )}
                </div>
              </motion.div>
              
              {/* Content Area with scroll */}
              <div 
                className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]"
                onScroll={handleScroll}
              >
                <AnimatePresence mode="wait">
                  {activeSection === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <motion.h3 
                        className="text-xl font-bold text-white"
                        custom={0}
                        variants={fadeInUpVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        Overview
                      </motion.h3>
                      
                      <motion.div
                        className="prose prose-invert max-w-none"
                        custom={1}
                        variants={fadeInUpVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <p className="text-gray-300 leading-relaxed">{planData.overview}</p>
                        
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.div 
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
                            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.2)' }}
                          >
                            <div className="flex items-center mb-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                                <Calendar className="h-5 w-5 text-purple-400" />
                              </div>
                              <h4 className="font-medium text-white">Trip Duration</h4>
                            </div>
                            <p className="text-gray-400">{planData.dates}</p>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
                            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.2)' }}
                          >
                            <div className="flex items-center mb-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                                <Compass className="h-5 w-5 text-blue-400" />
                              </div>
                              <h4 className="font-medium text-white">Destination</h4>
                            </div>
                            <p className="text-gray-400">{planData.destination}</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {activeSection === 'itinerary' && (
                    <motion.div
                      key="itinerary"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <motion.h3 
                        className="text-xl font-bold text-white"
                        custom={0}
                        variants={fadeInUpVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        Sayaji Baug Travel Itinerary
                      </motion.h3>
                      
                      <div className="space-y-8">
                        {planData.days.map((day, index) => (
                          <motion.div
                            key={index}
                            custom={index + 1}
                            variants={fadeInUpVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative"
                          >
                            {/* Line connector */}
                            {index < planData.days.length - 1 && (
                              <div className="absolute top-14 bottom-0 left-[25px] w-0.5 bg-gradient-to-b from-indigo-500/60 to-indigo-500/20" />
                            )}
                            
                            <div className="flex">
                              {/* Day indicator with animation */}
                              <motion.div 
                                className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium shrink-0 z-10 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                whileHover={{ 
                                  scale: 1.1,
                                  boxShadow: '0 0 25px rgba(79,70,229,0.6)'
                                }}
                              >
                                <span>#{index + 1}</span>
                              </motion.div>
                              
                              <div className="ml-6 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-indigo-500/20 w-full">
                                <h4 className="text-lg font-semibold text-white mb-2">{day.title}</h4>
                                <p className="text-gray-300 mb-4">{day.description}</p>
                                
                                <ul className="space-y-3">
                                  {day.activities.map((activity, actIdx) => (
                                    <li key={actIdx} className="flex items-start">
                                      <div className="bg-indigo-500/10 p-1.5 rounded-lg mr-3 mt-0.5">
                                        <Star className="h-4 w-4 text-indigo-400" />
                                      </div>
                                      <span className="text-gray-300">{activity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {activeSection === 'digitalNomad' && planData.digitalNomadSetup && (
                    <motion.div
                      key="digitalNomad"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <motion.h3 
                        className="text-xl font-bold text-white"
                        custom={0}
                        variants={fadeInUpVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        Digital Nomad Setup
                      </motion.h3>
                      
                      <motion.div
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/20"
                        custom={1}
                        variants={fadeInUpVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <div className="flex items-start mb-4">
                          <div className="p-2 bg-blue-500/20 rounded-lg mr-3 mt-1">
                            <Wifi className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Connectivity Details</h4>
                            <p className="text-gray-300">{planData.digitalNomadSetup}</p>
                          </div>
                        </div>
                        
                        <motion.div 
                          className="grid grid-cols-2 gap-4 mt-6"
                          custom={2}
                          variants={fadeInUpVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 bg-indigo-500/20 rounded-lg mr-2">
                                <Coffee className="h-4 w-4 text-indigo-400" />
                              </div>
                              <h5 className="font-medium text-white">Coworking Spaces</h5>
                            </div>
                            <p className="text-gray-400 text-sm">Variety of cafes and coworking spaces available</p>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20">
                            <div className="flex items-center mb-2">
                              <div className="p-1.5 bg-purple-500/20 rounded-lg mr-2">
                                <Wifi className="h-4 w-4 text-purple-400" />
                              </div>
                              <h5 className="font-medium text-white">Internet Speed</h5>
                            </div>
                            <p className="text-gray-400 text-sm">Moderate internet speeds available</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Progress indicator */}
              <motion.div 
                className="h-1 bg-gradient-to-r from-indigo-600 to-purple-600 absolute bottom-0 left-0"
                style={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default TravelPlanModal; 