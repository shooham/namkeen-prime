import React, { useState, useEffect } from 'react';
import SettingsLayout from '@/components/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star, Zap, Shield, Globe, Infinity, CreditCard, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Billing History Component
const BillingHistory: React.FC<{ userId?: string }> = ({ userId }) => {
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingHistory = async () => {
      if (!userId) return;
      
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(10);

        if (orders) {
          setBillingHistory(orders);
        }
      } catch (error) {
        console.error('Error fetching billing history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingHistory();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-4">Loading billing history...</div>;
  }

  if (billingHistory.length === 0) {
    return <div className="text-center py-4 text-text-secondary">No billing history found.</div>;
  }

  return (
    <div className="space-y-4">
      {billingHistory.map((order, index) => {
        const planName = order.amount === '99' ? 'Mini' : 
                        order.amount === '149' ? 'Quick' :
                        order.amount === '249' ? 'Monthly' :
                        order.amount === '499' ? '3 Month' :
                        order.amount === '649' ? '6 Month' :
                        order.amount === '1299' ? 'Yearly' : 'Unknown';
        
        return (
          <div key={index} className="flex items-center justify-between p-4 bg-bg-primary/30 rounded-lg">
            <div>
              <p className="text-text-primary font-medium">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-text-secondary">{planName} Plan</p>
              <p className="text-xs text-text-secondary">Order: {order.order_id}</p>
            </div>
            <div className="text-right">
              <p className="text-text-primary font-medium">₹{order.amount}</p>
              <Badge className="bg-green-500 text-white text-xs">Paid</Badge>
            </div>
          </div>
        );
      })}
      <div className="mt-4">
        <Button variant="outline" className="w-full border-border-standard text-text-primary">
          View All Invoices
        </Button>
      </div>
    </div>
  );
};

const SubscriptionSettings = () => {
  // CRITICAL FIX: All hooks must be called at the top level, before any early returns
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { initiatePayment, loading: paymentLoading } = usePayment();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('monthly');
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);

  // CRITICAL FIX: Fetch user subscriptions on component mount - moved to top level
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      // Conditional logic moved INSIDE the useEffect
      if (!user) return;
      
      try {
        // Check user_subscriptions table first
        const { data: userSubs, error: userSubError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              price,
              duration_days,
              description
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('end_date', { ascending: false });

        if (userSubs && userSubs.length > 0) {
          setUserSubscriptions(userSubs);
          // Set current plan to the longest active subscription
          const longestSub = userSubs[0];
          const planMapping: { [key: string]: string } = {
            'Mini': 'mini',
            'Quick': 'quick', 
            'Monthly': 'monthly',
            '3 Month': '3month',
            '6 Month': '6month',
            'Yearly': 'yearly'
          };
          setCurrentPlan(planMapping[longestSub.subscription_plans?.name] || 'monthly');
          return;
        }

        // Fallback to legacy subscriptions table - FIXED: using user_id instead of profile_id
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id) // CRITICAL FIX: Changed from profile_id to user_id
          .eq('status', 'active')
          .gte('current_period_end', new Date().toISOString())
          .order('current_period_end', { ascending: false });

        if (data && data.length > 0) {
          // Convert legacy subscriptions to new format for display
          const legacySubscriptions = data.map(sub => ({
            id: sub.id,
            start_date: sub.current_period_start?.split('T')[0],
            end_date: sub.current_period_end?.split('T')[0],
            status: sub.status,
            subscription_plans: {
              name: sub.plan === 'premium' ? 'Premium' : sub.plan === 'ultra' ? 'Ultra' : 'Basic',
              price: '249',
              duration_days: 30,
              description: 'Legacy subscription'
            }
          }));
          setUserSubscriptions(legacySubscriptions);
          setCurrentPlan(data[0].plan);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };

    fetchUserSubscriptions();
  }, [user]);

  // Show loading spinner while authentication is being checked
  if (authLoading) {
    return (
      <SettingsLayout 
        title="Subscription Settings" 
        subtitle="Manage your subscription and billing preferences"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your profile...</p>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  const subscriptionPlans = [
    {
      id: 'mini',
      name: 'Mini',
      price: '₹99',
      priceValue: 99,
      period: '3 days',
      duration: 3,
      description: 'Perfect for quick trials',
      features: [
        'HD Streaming',
        'Ad-free experience',
        'Basic recommendations',
        '1 device streaming',
        'Download for offline viewing'
      ],
      icon: Star,
      popular: false,
      color: 'text-blue-400'
    },
    {
      id: 'quick',
      name: 'Quick',
      price: '₹149',
      priceValue: 149,
      period: '15 days',
      duration: 15,
      description: 'Great for short-term viewing',
      features: [
        'Full HD Streaming',
        'Ad-free experience',
        'Personalized recommendations',
        '2 device streaming',
        'Download for offline viewing',
        'Priority support'
      ],
      icon: Shield,
      popular: false,
      color: 'text-green-400'
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '₹249',
      priceValue: 249,
      period: '30 days',
      duration: 30,
      description: 'Best value for regular viewers',
      features: [
        '4K Ultra HD Streaming',
        'Ad-free experience',
        'Advanced recommendations',
        '4 device streaming',
        'Download for offline viewing',
        'Exclusive content access',
        'Priority support'
      ],
      icon: Crown,
      popular: true,
      color: 'text-yellow-400'
    },
    {
      id: '3month',
      name: '3 Month',
      price: '₹499',
      priceValue: 499,
      period: '90 days',
      duration: 90,
      description: 'Great savings for longer commitment',
      features: [
        '4K Ultra HD Streaming',
        'Ad-free experience',
        'Advanced recommendations',
        '6 device streaming',
        'Download for offline viewing',
        'Exclusive content access',
        'Priority support',
        'Early access to features'
      ],
      icon: Globe,
      popular: false,
      color: 'text-purple-400'
    },
    {
      id: '6month',
      name: '6 Month',
      price: '₹649',
      priceValue: 649,
      period: '180 days',
      duration: 180,
      description: 'Maximum savings for dedicated users',
      features: [
        '8K Ultra HD Streaming',
        'Ad-free experience',
        'Advanced recommendations',
        '8 device streaming',
        'Download for offline viewing',
        'Exclusive content access',
        'Priority support',
        'Early access to features',
        'Creator tools access'
      ],
      icon: Zap,
      popular: false,
      color: 'text-red-400'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '₹1,299',
      priceValue: 1299,
      period: '365 days',
      duration: 365,
      description: 'Ultimate value for long-term subscribers',
      features: [
        '8K Ultra HD Streaming',
        'Ad-free experience',
        'Advanced recommendations',
        'Unlimited device streaming',
        'Download for offline viewing',
        'Exclusive content access',
        'Priority support',
        'Early access to features',
        'Creator tools access',
        'Dedicated account manager'
      ],
      icon: Infinity,
      popular: false,
      color: 'text-indigo-400'
    }
  ];

  const handlePlanChange = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to purchase a subscription.",
        variant: "destructive",
      });
      return;
    }

    const selectedPlan = subscriptionPlans.find(p => p.id === planId);
    if (!selectedPlan) return;

    try {
      // First, get the actual database plan ID by name
      const { data: dbPlan, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price, duration_days, description')
        .eq('name', selectedPlan.name)
        .eq('is_active', true)
        .single();

      if (error || !dbPlan) {
        console.error('Database plan not found:', error);
        toast({
          title: "Plan Not Available",
          description: "This subscription plan is currently not available. Please try another plan.",
          variant: "destructive",
        });
        return;
      }

      console.log('DEBUG: Using database plan ID:', dbPlan.id);

      // CRITICAL FIX: Call initiatePayment with only the database plan ID
      await initiatePayment(dbPlan.id);
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <SettingsLayout 
      title="Subscription Settings" 
      subtitle="Manage your subscription and billing preferences"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Current Subscriptions Status */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Crown className="h-5 w-5 mr-2 text-primary-green" />
              Current Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {userSubscriptions.map((subscription, index) => {
                  const daysRemaining = Math.ceil(
                    (new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={index} className="p-4 bg-bg-primary/30 rounded-lg border border-border-standard">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">
                            {subscription.subscription_plans?.name} Plan
                          </h3>
                          <p className="text-text-secondary mt-1">
                            ₹{subscription.subscription_plans?.price} for {subscription.subscription_plans?.duration_days} days
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            {subscription.subscription_plans?.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-sm text-text-secondary">
                              Started: <span className="text-primary-green">{new Date(subscription.start_date).toLocaleDateString()}</span>
                            </p>
                            <p className="text-sm text-text-secondary">
                              Expires: <span className="text-primary-green">{new Date(subscription.end_date).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${daysRemaining > 7 ? 'bg-green-500' : daysRemaining > 0 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                          </Badge>
                          <p className="text-xs text-text-secondary mt-1">
                            Status: Active
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {userSubscriptions.length > 1 && (
                  <div className="mt-4 p-3 bg-primary-green/10 rounded-lg border border-primary-green/30">
                    <p className="text-sm text-primary-green font-medium">
                      🎉 You have {userSubscriptions.length} active subscriptions! 
                      Your access will continue until the longest subscription expires.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-text-secondary mb-4">
                  <Crown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active subscriptions found</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '#available-plans'}
                  className="bg-primary-green hover:bg-primary-green/90 text-bg-primary"
                >
                  Choose a Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div id="available-plans">
          <h2 className="text-2xl font-orbitron font-bold text-text-primary mb-6">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              const hasThisPlan = userSubscriptions.some(sub => 
                sub.subscription_plans?.name === plan.name
              );
              
              return (
                <Card 
                  key={plan.id} 
                  className={`bg-bg-secondary/50 border-border-standard transition-all duration-300 hover:border-primary-green/50 ${
                    hasThisPlan ? 'ring-2 ring-primary-green' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-6 w-6 ${plan.color}`} />
                        <CardTitle className="text-text-primary">{plan.name}</CardTitle>
                      </div>
                      {plan.popular && (
                        <Badge className="bg-primary-green text-bg-primary">
                          Popular
                        </Badge>
                      )}
                      {hasThisPlan && (
                        <Badge className="bg-blue-500 text-white">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                      <span className="text-text-secondary">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-primary-green flex-shrink-0" />
                          <span className="text-sm text-text-primary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={paymentLoading}
                      className="w-full bg-primary-green hover:bg-primary-green/90 text-bg-primary"
                    >
                      {paymentLoading ? 'Processing...' : hasThisPlan ? 'Extend Plan' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-green" />
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BillingHistory userId={user?.id} />
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
};

export default SubscriptionSettings; 