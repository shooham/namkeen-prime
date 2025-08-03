import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { User, Settings, Download, Crown, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import profileHero from '@/assets/profile-hero.jpg';

const Profile = () => {
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to get user's display name from Google metadata
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    // Try to get name from user_metadata (Google OAuth data)
    const metadata = user.user_metadata;
    if (metadata?.full_name) {
      return metadata.full_name;
    }
    if (metadata?.name) {
      return metadata.name;
    }
    if (metadata?.first_name && metadata?.last_name) {
      return `${metadata.first_name} ${metadata.last_name}`;
    }
    
    // Fallback to email if no name is available
    return user.email?.split('@')[0] || 'User';
  };

  // Helper function to get user's avatar from Google metadata
  const getUserAvatar = () => {
    if (!user) return null;
    
    const metadata = user.user_metadata;
    return metadata?.avatar_url || metadata?.picture || null;
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  const userStats = [
    { label: 'Series Watched', value: '24', icon: Download },
    { label: 'Downloads', value: '8', icon: Download },
    { label: 'Watch Time', value: '156h', icon: Download },
    { label: 'Premium Status', value: 'Active', icon: Crown }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary pb-16 md:pb-0">
        <Navigation isAuthenticated={false} />
        <MobileBottomNav isAuthenticated={false} />
        
        {/* Google Sign-in Prompt */}
        <div className="relative h-screen flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${profileHero})` }}
          />
          <div className="relative text-center max-w-md mx-auto px-4">
            <User className="h-16 w-16 text-primary-green mx-auto mb-6" />
            <h1 className="text-3xl font-orbitron font-bold text-text-primary mb-4">
              Join Namkeen Prime
            </h1>
            <p className="text-text-secondary mb-8">
              Sign in to access your profile, favorites, and personalized recommendations
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                size="lg"
                className="w-full h-12 border-2 border-primary-green/30 bg-transparent hover:bg-primary-green/10 hover:border-primary-green/50 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16 md:pb-0">
      <Navigation isAuthenticated={!!user} />
      <MobileBottomNav isAuthenticated={!!user} />

      {/* Profile Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${profileHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 lg:px-8 pb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {getUserAvatar() ? (
                  <img 
                    src={getUserAvatar()} 
                    alt={getUserDisplayName()}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-green/30"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary-green to-accent-glow rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 md:h-16 md:w-16 text-bg-primary" />
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
                  <Crown className="h-4 w-4 text-bg-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-text-primary mb-2">
                  {getUserDisplayName()}
                </h1>
                <div className="flex items-center space-x-4 text-text-secondary">
                  <span className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Premium Member</span>
                  </span>
                  <span>Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {userStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-bg-secondary/50 border border-border-standard rounded-lg p-4 text-center">
                <Icon className="h-6 w-6 text-primary-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Account Settings */}
        <div className="mt-12 bg-bg-secondary/50 border border-border-standard rounded-lg p-6">
          <h2 className="text-2xl font-orbitron font-bold text-text-primary mb-6 flex items-center">
            <Settings className="h-6 w-6 text-primary-green mr-2" />
            Account Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/edit-profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/privacy')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/subscription')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Subscription Settings
              </Button>
            </div>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/downloads')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings/preferences')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;