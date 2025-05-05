import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Create a mock user type
interface User {
  email: string;
  displayName: string | null;
  uid: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Create a dummy user
  const dummyUser: User = {
    email: 'guest@example.com',
    displayName: 'Guest User',
    uid: 'guest-user-id'
  };

  const [loading, setLoading] = useState(false);

  // Mock auth functions that do nothing
  const signup = async () => {
    console.log('Auth is disabled - using guest access');
  };

  const login = async () => {
    console.log('Auth is disabled - using guest access');
  };

  const loginWithGoogle = async () => {
    console.log('Auth is disabled - using guest access');
  };

  const logout = async () => {
    console.log('Auth is disabled - using guest access');
  };

  const value = {
    currentUser: dummyUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 