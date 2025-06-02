import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  googleProvider,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  signInAnonymously
} from '@/lib/firebase';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  isGuestUser: boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsGuestUser(user?.isAnonymous || false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      if (!result.user) {
        throw new Error('Failed to create guest account');
      }
      setIsGuestUser(true);
      // Create a basic profile for the guest user
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        isGuest: true,
        createdAt: new Date(),
        lastLogin: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Guest login error:', error);
      setIsGuestUser(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsGuestUser(false);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    loginAsGuest,
    logout,
    isGuestUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 