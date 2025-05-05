import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import ImageCarousel from '@/components/ImageCarousel';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signup(email, password);
      navigate('/');
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      });
    } catch (error) {
      let message = "Failed to create account";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Registration Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
      navigate('/');
      toast({
        title: "Account created",
        description: "Your account has been created successfully with Google",
      });
    } catch (error) {
      let message = "Failed to sign up with Google";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        title: "Registration Error",
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
      
      {/* Signup Content */}
      <div className="min-h-screen relative z-40 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Welcome Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text tracking-tight mb-4">
              Wanderlust Whisper
            </h1>
            <p className="text-white mb-4">
              Join our community of global nomads
            </p>
          </div>
          
          {/* Signup Card */}
          <Card className="backdrop-blur-sm bg-card/60 border-gray-800">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center gradient-text mb-4">
                Create an account
              </CardTitle>
              <CardDescription className="text-center text-white mb-4">
                Sign up to discover nomadic destinations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Sign Up */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border-gray-700"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  "Signing up..."
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 0, 0)">
                        <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" fill="#ffffff" />
                      </g>
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </Button>
              
              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full bg-gray-700" />
                <span className="relative bg-card/60 px-2 text-white text-sm backdrop-blur-sm">
                  or continue with email
                </span>
              </div>
              
              {/* Email & Password Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="bg-white/10 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-white">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="bg-white/10 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirm Password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="bg-white/10 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-gradient" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-center text-sm w-full text-white">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup; 