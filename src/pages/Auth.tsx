import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Auth: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔄 Handling OAuth callback...');
        
        // Check for OAuth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          toast({
            title: "Session Error",
            description: sessionError.message,
            variant: "destructive",
          });
          return;
        }

        if (session) {
          console.log('✅ Session found for user:', session.user.email);
          
          // Ensure user profile exists in streaming_profiles table
          console.log('🔍 Checking if user profile exists...');
          const { data: existingUser, error: userError } = await supabase
            .from('streaming_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('❌ User check error:', userError);
          }

          if (!existingUser) {
            console.log('🆕 Creating user profile for:', session.user.email);
            
            // Create user profile in streaming_profiles table
            const { error: createError } = await supabase
              .from('streaming_profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                username: session.user.user_metadata?.username || 
                         session.user.user_metadata?.full_name || 
                         session.user.user_metadata?.name || 
                         session.user.email?.split('@')[0] || 'user',
                full_name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || '',
                avatar_url: session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture || 
                           `https://ui-avatars.com/api/?background=00FF88&color=000&name=${encodeURIComponent(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User')}`,
                subscription_tier: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              });

            if (createError) {
              console.error('❌ Profile creation error:', createError);
              
              // Try to create in profiles table as fallback
              console.log('🔄 Trying fallback profile creation...');
              const { error: fallbackError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  username: session.user.user_metadata?.username || 
                           session.user.user_metadata?.full_name || 
                           session.user.user_metadata?.name || 
                           session.user.email?.split('@')[0] || 'user',
                  avatar_url: session.user.user_metadata?.avatar_url || 
                             session.user.user_metadata?.picture || 
                             `https://ui-avatars.com/api/?background=00FF88&color=000&name=${encodeURIComponent(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User')}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (fallbackError) {
                console.error('❌ Fallback profile creation also failed:', fallbackError);
                toast({
                  title: "Profile Creation Error",
                  description: "Failed to create user profile. Please contact support.",
                  variant: "destructive",
                });
                return;
              } else {
                console.log('✅ Fallback profile created successfully');
              }
            } else {
              console.log('✅ User profile created successfully');
            }
            
            toast({
              title: "Welcome!",
              description: "Your profile has been created successfully.",
              variant: "default",
            });
          } else {
            console.log('👤 User profile already exists');
            
            // Update last login
            await supabase
              .from('streaming_profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          }

          // Navigate to home
          console.log('🏠 Navigating to home page...');
          navigate('/');
        } else {
          console.log('ℹ️ No session found, staying on auth page');
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        toast({
          title: "Authentication Error",
          description: "An error occurred during authentication. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleOAuthCallback();
    
    if (user) {
      console.log('👤 User already authenticated, navigating to home');
      navigate('/');
    }
  }, [user, navigate, toast]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-glow/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Play className="h-16 w-16 text-primary-green" />
              <div className="absolute inset-0 h-16 w-16 bg-accent-glow/20 rounded-full blur-lg"></div>
            </div>
            <h1 className="text-5xl font-orbitron font-bold text-text-primary">
              Namkeen <span className="text-primary-green holo-gradient bg-clip-text text-transparent">Prime</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg max-w-md mx-auto">
            Enter the world of premium entertainment with Namkeen Prime
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border-standard p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-orbitron font-bold text-text-primary mb-2">
                Welcome Back
              </h2>
              <p className="text-text-secondary">
                Sign in to your account to continue
              </p>
            </div>

            {/* Google Login Button */}
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

            <div className="mt-8 text-center">
              <p className="text-text-secondary text-sm">
                By signing in, you agree to our{' '}
                <a href="#" className="text-primary-green hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-green hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-text-secondary hover:text-primary-green"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;