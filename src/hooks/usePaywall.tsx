import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useAuth } from './useAuth';

export const usePaywall = () => {
  const { user } = useAuth();
  const { isSubscribed, isLoading: subscriptionLoading, refreshSubscriptionStatus } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContext, setPaywallContext] = useState<{
    seriesTitle?: string;
    seriesId?: string;
    episodeId?: string;
  }>({});

  const checkAccess = useCallback((seriesId?: string, episodeId?: string, seriesTitle?: string) => {
    // If user is not logged in, show paywall
    if (!user) {
      setPaywallContext({ seriesTitle, seriesId, episodeId });
      setShowPaywall(true);
      return false;
    }

    // If subscription is still loading, wait
    if (subscriptionLoading) {
      return null; // Still loading
    }

    // If user is not subscribed, show paywall
    if (!isSubscribed) {
      setPaywallContext({ seriesTitle, seriesId, episodeId });
      setShowPaywall(true);
      return false;
    }

    // User has access
    return true;
  }, [user, isSubscribed, subscriptionLoading]);

  const openPaywall = useCallback((seriesTitle?: string, seriesId?: string, episodeId?: string) => {
    // Refresh subscription status before showing paywall
    refreshSubscriptionStatus();
    setPaywallContext({ seriesTitle, seriesId, episodeId });
    setShowPaywall(true);
  }, [refreshSubscriptionStatus]);

  const closePaywall = useCallback(() => {
    setShowPaywall(false);
    setPaywallContext({});
  }, []);

  const requireSubscription = useCallback((callback: () => void, seriesTitle?: string) => {
    if (!user) {
      openPaywall(seriesTitle);
      return;
    }

    if (subscriptionLoading) {
      // Wait for subscription status to load
      return;
    }

    // Refresh subscription status before checking
    refreshSubscriptionStatus();
    
    // Small delay to allow refresh to complete
    setTimeout(() => {
      if (!isSubscribed) {
        openPaywall(seriesTitle);
        return;
      }
      
      // User has access, execute callback
      callback();
    }, 100);
  }, [user, isSubscribed, subscriptionLoading, openPaywall, refreshSubscriptionStatus]);

  return {
    showPaywall,
    paywallContext,
    checkAccess,
    openPaywall,
    closePaywall,
    requireSubscription,
    isSubscribed,
    subscriptionLoading
  };
}; 