import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import ImageCarousel from '@/components/ImageCarousel';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      let message = "Failed to login";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Authentication Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      let message = "Failed to sign in with Google";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Authentication Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Image Carousel Background */}
      <ImageCarousel className="absolute inset-0" />
      
      {/* Login Content */}
      <div className="min-h-screen relative z-40 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Welcome Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text tracking-tight mb-4">
              Nomadic Trails
            </h1>
            <p className="text-gray-800 font-medium mb-4">
              Explore the world's best nomadic destinations
            </p>
          </div>
          
          {/* Login Card */}
          <Card className="backdrop-blur-sm bg-white/95 border border-gray-200 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-gray-800 mb-2">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Log in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Sign In */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 0, 0)">
                        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" fill="#4285f4" />
                      </g>
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </Button>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-600">Or continue with</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="email"
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border-gray-200 focus:border-primary"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-gradient" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-center text-sm w-full text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login; 