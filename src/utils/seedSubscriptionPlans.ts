import { supabase } from '@/lib/supabase';

export const defaultSubscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for casual viewers',
    price_monthly: 299,
    price_yearly: 2999,
    currency: 'INR',
    max_devices: 1,
    max_quality: 'HD',
    has_ads: false,
    is_active: true,
    features: [
      'HD Quality Streaming',
      'Ad-free Experience',
      'Watch on 1 Device',
      'Download for Offline',
      'Cancel Anytime'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Best value for families',
    price_monthly: 599,
    price_yearly: 5999,
    currency: 'INR',
    max_devices: 4,
    max_quality: '4K',
    has_ads: false,
    is_active: true,
    features: [
      '4K Ultra HD Quality',
      'Ad-free Experience',
      'Watch on 4 Devices',
      'Download for Offline',
      'Exclusive Content',
      'Priority Support',
      'Cancel Anytime'
    ]
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: 'Ultimate entertainment experience',
    price_monthly: 999,
    price_yearly: 9999,
    currency: 'INR',
    max_devices: 6,
    max_quality: '4K',
    has_ads: false,
    is_active: true,
    features: [
      '4K Ultra HD Quality',
      'Ad-free Experience',
      'Watch on 6 Devices',
      'Download for Offline',
      'Exclusive Content',
      'Priority Support',
      'Early Access to New Releases',
      'Cancel Anytime'
    ]
  }
];

export async function seedSubscriptionPlans() {
  try {
    // Check if seeding was already attempted in this session
    const seedKey = 'subscription_plans_seeded';
    if (sessionStorage.getItem(seedKey)) {
      console.log('✅ Subscription plans seeding already attempted this session');
      return true;
    }

    console.log('🌱 Seeding subscription plans...');

    // Check if plans already exist
    const { data: existingPlans, error: checkError } = await supabase
      .from('subscription_plans')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing plans:', checkError);
      // Mark as attempted even on error to prevent infinite retries
      sessionStorage.setItem(seedKey, 'error');
      return false;
    }

    if (existingPlans && existingPlans.length > 0) {
      console.log('✅ Subscription plans already exist, skipping seed');
      sessionStorage.setItem(seedKey, 'exists');
      return true;
    }

    // Insert default plans
    const { error: insertError } = await supabase
      .from('subscription_plans')
      .insert(defaultSubscriptionPlans);

    if (insertError) {
      console.error('Error inserting subscription plans:', insertError);
      sessionStorage.setItem(seedKey, 'error');
      return false;
    }

    console.log('✅ Successfully seeded subscription plans');
    sessionStorage.setItem(seedKey, 'success');
    return true;
  } catch (error) {
    console.error('Error in seedSubscriptionPlans:', error);
    sessionStorage.setItem('subscription_plans_seeded', 'error');
    return false;
  }
}

// Function to call from browser console for manual seeding
(window as any).seedSubscriptionPlans = seedSubscriptionPlans;