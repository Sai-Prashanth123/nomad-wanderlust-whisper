import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ChatHome from './components/ChatHome';

import { FavoritesProvider } from "./components/ResponseHandler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FavoritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute requireAuth>
                    <Layout>
                      <ChatHome />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile route (requires auth) */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireAuth>
                    <Layout>
                      <div>Profile Page</div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              
              {/* Add other protected routes with Layout */}
              <Route 
                path="/explore" 
                element={
                  <ProtectedRoute requireAuth>
                    <Layout>
                      <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6 gradient-text">Explore Destinations</h1>
                        <p className="mb-8">Discover amazing nomadic destinations around the world.</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute requireAuth>
                    <Layout>
                      <ChatHome />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/library" 
                element={
                  <ProtectedRoute requireAuth>
                    <Layout>
                      <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6 gradient-text">Your Travel Library</h1>
                        <p className="mb-8">Access saved destinations and personalized guides.</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Public travel plan demo for showcasing the feature */}
              
              
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
