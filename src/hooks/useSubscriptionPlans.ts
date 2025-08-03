import { useState, useEffect } from 'react';
import { subscriptionPlansService, type PaymentPlan } from '@/services/subscriptionPlansService';

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const subscriptionPlans = await subscriptionPlansService.getActivePlans();
        setPlans(subscriptionPlans);
      } catch (err) {
        console.error('Error loading subscription plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const refreshPlans = async () => {
    await loadPlans();
  };

  return {
    plans,
    loading,
    error,
    refreshPlans
  };
};