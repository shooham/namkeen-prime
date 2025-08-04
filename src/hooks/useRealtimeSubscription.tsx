import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeSubscriptionStatus {
  isSubscribed: boolean;
  plan: string | null;
  expiresAt: Date | null;
  isLoading: boolean;
  error: string | null;
  productName: string | null;
}

export const useRealtimeSubscription = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<RealtimeSubscriptionStatus>({
    isSubscribed: false,
    plan: null,
    expiresAt: null,
    isLoading: true,
    error: null,
    productName: null
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        isSubscribed: false,
        plan: null,
        expiresAt: null,
        isLoading: false,
        error: null,
        productName: null
      });
      return;
    }

    // Debounce mechanism to prevent rapid successive calls
    const checkKey = `subscription_check_${user.id}`;
    const lastCheck = sessionStorage.getItem(checkKey);
    const now = Date.now();
    
    if (lastCheck && now - parseInt(lastCheck) < 2000) { // 2 second debounce
      console.log('🔄 Subscription check debounced, skipping...');
      return;
    }
    
    sessionStorage.setItem(checkKey, now.toString());

    try {
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔍 Checking production subscription status for user:', user.id);

      // CRITICAL FIX: Ensure we have a valid session before querying
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No valid session found:', sessionError);
        setSubscriptionStatus({
          isSubscribed: false,
          plan: null,
          expiresAt: null,
          isLoading: false,
          error: 'Authentication required. Please login again.',
          productName: null
        });
        return;
      }

      console.log('✅ Valid session found for user:', session.user.id);

      // Query user_subscriptions table with plan details
      // CRITICAL FIX: Using correct table name
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            description,
            price,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('end_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching subscriptions:', error);
        
        // CRITICAL FIX: Don't throw error immediately, try fallback
        console.log('🔄 Trying fallback query without products join...');
        
        // Fallback query without join
        const { data: fallbackSubs, error: fallbackError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('end_date', { ascending: false });

        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          
          // If both queries fail, it might be an RLS issue
          if (fallbackError.message.includes('RLS') || fallbackError.message.includes('policy')) {
            setSubscriptionStatus({
              isSubscribed: false,
              plan: null,
              expiresAt: null,
              isLoading: false,
              error: 'Please refresh the page and try again.',
              productName: null
            });
            return;
          }
          
          throw fallbackError;
        }

        console.log('📊 Fallback subscription result:', fallbackSubs);
        
        if (fallbackSubs && fallbackSubs.length > 0) {
          const activeSubscription = fallbackSubs[0];
          const expiresAt = new Date(activeSubscription.end_date);
          
          // Get plan details separately
          const { data: productData } = await supabase
            .from('subscription_plans')
            .select('name, description, price, features')
            .eq('id', activeSubscription.plan_id)
            .single();
          
          console.log('✅ Active subscription found (fallback):', {
            isSubscribed: true,
            plan: productData?.name || 'Premium',
            expiresAt
          });

          setSubscriptionStatus({
            isSubscribed: true,
            plan: productData?.name || 'Premium',
            expiresAt,
            isLoading: false,
            error: null,
            productName: productData?.name || 'Premium'
          });
          return;
        }
      }

      console.log('📊 Production subscription result:', subscriptions);

      if (subscriptions && subscriptions.length > 0) {
        const activeSubscription = subscriptions[0];
        const expiresAt = new Date(activeSubscription.end_date);
        
        console.log('✅ Active subscription found:', {
          isSubscribed: true,
          plan: activeSubscription.subscription_plans?.name,
          expiresAt,
          productName: activeSubscription.subscription_plans?.name
        });

        setSubscriptionStatus({
          isSubscribed: true,
          plan: activeSubscription.subscription_plans?.name || 'Premium',
          expiresAt,
          isLoading: false,
          error: null,
          productName: activeSubscription.subscription_plans?.name || null
        });
      } else {
        console.log('❌ No active subscription found');
        setSubscriptionStatus({
          isSubscribed: false,
          plan: null,
          expiresAt: null,
          isLoading: false,
          error: null,
          productName: null
        });
      }

    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
      
      setSubscriptionStatus({
        isSubscribed: false,
        plan: null,
        expiresAt: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        productName: null
      });
    }
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Initial check
    checkSubscriptionStatus();

    // CRITICAL FIX: Add timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Loading timeout reached, forcing loading to false');
      setSubscriptionStatus(prev => ({
        ...prev,
        isLoading: false,
        error: prev.error || 'Loading timeout - please refresh the page'
      }));
    }, 10000); // 10 second timeout

    // Listen for custom subscription update events (from payment success)
    const handleSubscriptionUpdate = () => {
      console.log('🔄 Custom subscription update event received, refreshing immediately...');
      // Clear any existing debounce
      sessionStorage.removeItem(`subscription_check_${user.id}`);
      // Immediate refresh
      checkSubscriptionStatus();
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);

    // Set up real-time channel for subscription changes
    const subscriptionChannel = supabase
      .channel(`subscription_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time user_subscriptions change detected:', payload);
          // Debounced refresh for subscription changes
          setTimeout(checkSubscriptionStatus, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time subscriptions change detected:', payload);
          setTimeout(checkSubscriptionStatus, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streaming_profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time streaming_profiles change detected:', payload);
          setTimeout(checkSubscriptionStatus, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time orders change detected:', payload);
          // If order status changed to paid, refresh subscription
          if (payload.new?.status === 'paid') {
            console.log('💰 Payment detected, refreshing subscription status...');
            setTimeout(checkSubscriptionStatus, 2000); // Longer delay for payment processing
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription channel connected successfully');
        }
      });

    setChannel(subscriptionChannel);

    // Set up a less frequent periodic refresh (5 minutes) as fallback
    const intervalId = setInterval(() => {
      console.log('🔄 Periodic subscription status refresh...');
      checkSubscriptionStatus();
    }, 300000); // 5 minutes instead of 30 seconds

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time subscription channel');
      subscriptionChannel.unsubscribe();
      clearInterval(intervalId);
      clearTimeout(loadingTimeout);
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, [user, checkSubscriptionStatus]);

  const refreshSubscriptionStatus = useCallback(() => {
    // Force refresh subscription status
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return {
    ...subscriptionStatus,
    refreshSubscriptionStatus,
    isRealTimeConnected: channel?.state === 'joined'
  };
};