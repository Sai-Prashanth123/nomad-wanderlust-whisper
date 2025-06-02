import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

const ProtectedRoute = ({ children, requireAuth = false }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state or spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Always redirect to login if user is not authenticated
  // This removes the guest functionality
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // If authenticated, render the children components
  return <>{children}</>;
};

export default ProtectedRoute; 