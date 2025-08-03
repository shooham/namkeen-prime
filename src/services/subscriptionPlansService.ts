import { supabase } from '@/lib/supabase';
import type { Tables } from '@/integrations/supabase/types';
import { seedSubscriptionPlans } from '@/utils/seedSubscriptionPlans';

export type SubscriptionPlan = Tables<'subscription_plans'>;

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  popular?: boolean;
  description?: string;
  max_devices?: number;
  max_quality?: string;
  has_ads?: boolean;
}

export const subscriptionPlansService = {
  async getActivePlans(): Promise<PaymentPlan[]> {
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        return getDefaultPlans();
      }

      if (!plans || plans.length === 0) {
        console.warn('No active subscription plans found, attempting to seed database...');
        
        // Try to seed the database with default plans
        const seedSuccess = await seedSubscriptionPlans();
        
        if (seedSuccess) {
          // Retry fetching plans after seeding
          const { data: newPlans, error: retryError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: true });
          
          if (!retryError && newPlans && newPlans.length > 0) {
            return convertPlansToPaymentPlans(newPlans);
          } else {
            return getDefaultPlans();
          }
        } else {
          return getDefaultPlans();
        }
      }

      return convertPlansToPaymentPlans(plans);
    } catch (error) {
      console.error('Error in getActivePlans:', error);
      return getDefaultPlans();
    }
  }
};

// Convert database plans to PaymentPlan format
function convertPlansToPaymentPlans(plans: SubscriptionPlan[]): PaymentPlan[] {
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: parseFloat(plan.price?.toString() || '0'),
    duration: plan.duration_days || 30,
    features: Array.isArray(plan.features) ? plan.features as string[] : [
      `${plan.max_quality || 'HD'} Quality Streaming`,
      plan.has_ads ? 'Limited Ads' : 'Ad-free Experience',
      `Watch on ${plan.max_devices === -1 ? 'Unlimited' : (plan.max_devices || 1)} Device${(plan.max_devices || 1) > 1 ? 's' : ''}`,
      'Download for Offline',
      'Cancel Anytime'
    ],
    description: plan.description || undefined,
    max_devices: plan.max_devices || undefined,
    max_quality: plan.max_quality || undefined,
    has_ads: plan.has_ads || false,
    popular: plan.name.toLowerCase().includes('3 month') || plan.name.toLowerCase().includes('monthly')
  }));
}

// Fallback default plans if database is empty or has issues
function getDefaultPlans(): PaymentPlan[] {
  return [
    {
      id: 'basic_monthly',
      name: 'Basic Monthly',
      price: 299,
      duration: 30,
      features: [
        'HD Quality Streaming',
        'Ad-free Experience',
        'Watch on 1 Device',
        'Download for Offline',
        'Cancel Anytime'
      ]
    },
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: 599,
      duration: 30,
      features: [
        '4K Ultra HD Quality',
        'Ad-free Experience',
        'Watch on 4 Devices',
        'Download for Offline',
        'Exclusive Content',
        'Priority Support',
        'Cancel Anytime'
      ],
      popular: true
    },
    {
      id: 'basic_yearly',
      name: 'Basic Yearly',
      price: 2999,
      duration: 365,
      features: [
        'HD Quality Streaming',
        'Ad-free Experience',
        'Watch on 1 Device',
        'Download for Offline',
        '2 Months Free',
        'Cancel Anytime'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: 5999,
      duration: 365,
      features: [
        '4K Ultra HD Quality',
        'Ad-free Experience',
        'Watch on 4 Devices',
        'Download for Offline',
        'Exclusive Content',
        'Priority Support',
        '2 Months Free',
        'Cancel Anytime'
      ]
    }
  ];
}