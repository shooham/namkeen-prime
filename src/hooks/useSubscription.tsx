import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: string | null;
  expiresAt: Date | null;
  isLoading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  // Use the real-time subscription hook
  const realtimeSubscription = useRealtimeSubscription();

  return {
    isSubscribed: realtimeSubscription.isSubscribed,
    plan: realtimeSubscription.plan,
    expiresAt: realtimeSubscription.expiresAt,
    isLoading: realtimeSubscription.isLoading,
    error: realtimeSubscription.error,
    refreshSubscriptionStatus: realtimeSubscription.refreshSubscriptionStatus,
    isRealTimeConnected: realtimeSubscription.isRealTimeConnected
  };
}; 