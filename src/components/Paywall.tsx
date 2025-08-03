import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Star, Play, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaywallProps {
  seriesTitle?: string;
  onClose?: () => void;
  showTrailer?: boolean;
  trailerUrl?: string;
}

export const Paywall: React.FC<PaywallProps> = ({ 
  seriesTitle, 
  onClose
}) => {
  const { user } = useAuth();
  const { isSubscribed, refreshSubscriptionStatus, isLoading } = useSubscription();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/settings/subscription');
  };

  const handleRefreshStatus = async () => {
    console.log('🔄 Manually refreshing subscription status...');
    
    // Force refresh subscription status
    refreshSubscriptionStatus();
    
    // Wait a moment for the refresh to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // The subscription hook will automatically update isSubscribed
    console.log('🔍 Subscription status after refresh:', { isSubscribed, isLoading });
  };

  // If user is subscribed, don't show paywall
  React.useEffect(() => {
    if (isSubscribed && !isLoading) {
      console.log('✅ User has active subscription, closing paywall');
      if (onClose) {
        onClose();
      }
    }
  }, [isSubscribed, isLoading, onClose]);

  if (isSubscribed && !isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg-secondary/95 backdrop-blur-md border border-border-standard rounded-3xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="relative p-8 text-center">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary w-8 h-8 p-0"
            >
              ✕
            </Button>
          )}
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-green/20 to-accent-glow/20 rounded-full">
              <Crown className="w-12 h-12 text-primary-green" />
            </div>
          </div>

          <h1 className="text-3xl font-orbitron font-bold text-text-primary mb-3">
            Premium Access Required
          </h1>
          
          {seriesTitle && (
            <p className="text-text-secondary text-lg mb-6">
              Unlock "{seriesTitle}" and thousands more premium content
            </p>
          )}

          <div className="inline-flex items-center space-x-2 bg-primary-green/10 border border-primary-green/30 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-primary-green" />
            <span className="text-primary-green font-semibold text-sm">
              Join 10,000+ Premium Members
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-green" />
              </div>
              <span className="text-text-secondary">Unlimited HD streaming</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary-green" />
              </div>
              <span className="text-text-secondary">Ad-free experience</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-primary-green" />
              </div>
              <span className="text-text-secondary">Exclusive premium content</span>
            </div>
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            className="w-full h-14 bg-gradient-to-r from-primary-green to-accent-glow hover:from-primary-green/90 hover:to-accent-glow/90 text-bg-primary font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5" />
              <span>Get Premium Access</span>
            </div>
          </Button>

          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="text-center mt-6 p-4 bg-bg-primary/30 rounded-xl border border-border-standard">
              <p className="text-text-secondary text-sm mb-3">
                Don't have an account?
              </p>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="border-primary-green text-primary-green hover:bg-primary-green hover:text-bg-primary"
              >
                Sign Up / Login
              </Button>
            </div>
          )}

          {/* Debug Section - Remove in production */}
          <div className="text-center mt-4">
            <Button
              onClick={handleRefreshStatus}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="text-text-secondary hover:text-text-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Checking...' : 'Refresh Status'}
            </Button>
            <p className="text-xs text-text-secondary mt-2">
              Having issues? Try refreshing your subscription status
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-text-secondary mt-6 pt-6 border-t border-border-standard">
            <p className="mb-1">🔒 Secure payments • Cancel anytime</p>
            <p>💳 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 