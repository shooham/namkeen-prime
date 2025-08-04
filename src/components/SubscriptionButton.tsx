import React from 'react';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'f11e0058-a21e-4579-b7fd-9fb60520dbde',
    name: 'Mini Plan',
    price: 99,
    duration: 7
  },
  {
    id: '8f13366e-e466-46f4-b490-b2e5dc795840',
    name: 'Quick Plan',
    price: 149,
    duration: 15
  },
  {
    id: '3300dc04-4a87-4817-a95b-ffb24c095556',
    name: 'Monthly Plan',
    price: 249,
    duration: 30
  },
  {
    id: '544b4a7f-41ea-4967-91ea-1c1aa536f27b',
    name: '3 Month Plan',
    price: 499,
    duration: 90
  },
  {
    id: '9898e85a-c5d7-4725-bd58-eb63aa11afe3',
    name: '6 Month Plan',
    price: 649,
    duration: 180
  },
  {
    id: '5b65a512-6562-4400-8182-791e678f25fe',
    name: 'Yearly Plan',
    price: 1299,
    duration: 365
  }
];

export const SubscriptionButton: React.FC = () => {
  const { initiatePayment, loading } = usePayment();
  const { user } = useAuth();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    console.log('🚀 === SUBSCRIPTION BUTTON CLICKED ===');
    console.log('📦 Plan details:', {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration: plan.duration
    });
    console.log('👤 Current user:', user?.email);
    console.log('⚡ Loading state:', loading);

    if (loading) {
      console.log('⏳ Payment already in progress, ignoring click');
      return;
    }

    try {
      console.log('🎯 Starting payment initiation...');
      await initiatePayment(plan.id);
      console.log('✅ Payment initiation completed');
    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Login Required
        </h3>
        <p className="text-yellow-700">
          Please login to purchase a subscription.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-4">
                ₹{plan.price}
              </div>
              <p className="text-gray-600 mb-6">
                {plan.duration} days access
              </p>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          💳 Secure payments powered by Razorpay
        </p>
        <p className="mt-1">
          🔒 Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
}; 