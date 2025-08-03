import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, User, Menu, Play, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  isAuthenticated?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isAuthenticated = false }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-standard bg-bg-secondary/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <Play className="h-8 w-8 text-primary-green group-hover:text-accent-glow transition-colors duration-300" />
                <div className="absolute inset-0 h-8 w-8 bg-accent-glow/20 rounded-full blur-lg group-hover:bg-accent-glow/40 transition-all duration-300" />
              </div>
              <h1 className="text-xl font-orbitron font-bold text-text-primary">
                Namkeen <span className="text-primary-green holo-gradient bg-clip-text text-transparent">Prime</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-text-secondary hover:text-primary-green transition-colors duration-300 font-medium"
            >
              Home
            </a>
            <a
              href="/series"
              className="text-text-secondary hover:text-primary-green transition-colors duration-300 font-medium"
            >
              Web Series
            </a>
            
            {isAuthenticated && (
              <div className="relative">
                <div className="flex items-center space-x-2 bg-bg-primary/50 rounded-lg px-3 py-2 border border-border-standard">
                  <Search className="h-4 w-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search series..."
                    className="bg-transparent text-text-primary placeholder-text-secondary outline-none w-48"
                  />
                </div>
              </div>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:flex"
                  onClick={() => navigate('/auth')}
                >
                  Login
                </Button>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-text-secondary">
                  <span className="text-sm">Welcome, {user?.user_metadata?.full_name || user?.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-green rounded-full animate-pulse" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;