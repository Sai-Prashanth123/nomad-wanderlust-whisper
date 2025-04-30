
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-100 bg-white/70 backdrop-blur-md fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-nomad-blue to-nomad-teal p-1 rounded-lg">
            <svg 
              className="w-7 h-7 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-nomad-blue to-nomad-teal text-transparent bg-clip-text">
              Nomadic Trails
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Personal Nomad Concierge</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-nomad-blue transition-colors">About</a>
          <a href="#" className="text-gray-600 hover:text-nomad-blue transition-colors">Help</a>
          <button className="bg-gradient-to-r from-nomad-blue to-nomad-teal hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
            Sign Up
          </button>
        </div>
        <button className="md:hidden text-gray-600">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
