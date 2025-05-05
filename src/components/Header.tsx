import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-nomad-blue to-nomad-teal flex items-center justify-center">
            <span className="text-white font-bold text-xl">NW</span>
          </div>
          <h1 className="font-bold text-xl tracking-tight">Wanderlust Whisper</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
