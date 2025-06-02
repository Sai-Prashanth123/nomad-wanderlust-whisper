import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-nomad-blue to-nomad-teal flex items-center justify-center">
            <span className="text-white font-bold text-xl">NW</span>
          </div>
          <h1 className="font-bold text-xl tracking-tight">Wanderlust Whisper</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentUser && (
            <>
              <div className="text-sm font-medium hidden md:block">
                {currentUser.email}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
