import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatHome from './components/ChatHome';
import TravelPlanExample from './components/TravelPlanExample';
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
              {/* All routes are now public */}
              <Route 
                path="/" 
                element={
                  <Layout>
                    <ChatHome />
                  </Layout>
                } 
              />
              
              <Route 
                path="/explore" 
                element={
                  <Layout>
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-3xl font-bold mb-6 gradient-text">Explore Destinations</h1>
                      <p className="mb-8">Discover amazing nomadic destinations around the world.</p>
                    </div>
                  </Layout>
                } 
              />
              
              <Route 
                path="/chat" 
                element={
                  <Layout>
                    <ChatHome />
                  </Layout>
                } 
              />
              
              <Route 
                path="/library" 
                element={
                  <Layout>
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-3xl font-bold mb-6 gradient-text">Your Travel Library</h1>
                      <p className="mb-8">Access saved destinations and personalized guides.</p>
                    </div>
                  </Layout>
                } 
              />
              
              {/* Travel Plan Example route (now public) */}
              <Route 
                path="/travel-plan-demo" 
                element={
                  <TravelPlanExample />
                } 
              />
              
              {/* Public travel plan demo for showcasing the feature */}
              <Route path="/demo" element={<TravelPlanExample />} />
              
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
