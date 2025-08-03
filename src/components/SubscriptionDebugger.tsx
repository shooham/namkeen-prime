import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionData {
  userSubscriptions: any[];
  subscriptions: any[];
  streamingProfile: any;
  orders: any[];
  payments: any[];
  subscriptionPlans: any[];
}

export const SubscriptionDebugger: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSubscriptionData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching all subscription data for user:', user.id);

      // Fetch user_subscriptions with plan details
      const { data: userSubscriptions, error: userSubError } = await supabase
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
        .order('created_at', { ascending: false });

      // Fetch subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch streaming_profiles
      const { data: streamingProfile, error: profileError } = await supabase
        .from('streaming_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch subscription plans
      const { data: subscriptionPlans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      setData({
        userSubscriptions: userSubscriptions || [],
        subscriptions: subscriptions || [],
        streamingProfile: streamingProfile || null,
        orders: orders || [],
        payments: payments || [],
        subscriptionPlans: subscriptionPlans || []
      });

      console.log('📊 All subscription data:', {
        userSubscriptions,
        subscriptions,
        streamingProfile,
        orders,
        payments,
        subscriptionPlans
      });

    } catch (err) {
      console.error('❌ Error fetching subscription data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSubscriptionStatus = () => {
    if (!data) return null;

    const now = new Date();
    
    // Check user_subscriptions first
    const activeUserSubs = data.userSubscriptions.filter(sub => 
      sub.status === 'active' && new Date(sub.end_date) > now
    );

    if (activeUserSubs.length > 0) {
      const latestSub = activeUserSubs.sort((a, b) => 
        new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0];
      
      return {
        source: 'user_subscriptions',
        isActive: true,
        plan: latestSub.subscription_plans?.name || 'Unknown',
        price: latestSub.subscription_plans?.price || 0,
        expiresAt: new Date(latestSub.end_date),
        daysRemaining: Math.ceil((new Date(latestSub.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
    }

    // Check legacy subscriptions
    const activeLegacySubs = data.subscriptions.filter(sub => 
      sub.status === 'active' && new Date(sub.current_period_end) > now
    );

    if (activeLegacySubs.length > 0) {
      const latestSub = activeLegacySubs.sort((a, b) => 
        new Date(b.current_period_end).getTime() - new Date(a.current_period_end).getTime()
      )[0];
      
      return {
        source: 'subscriptions',
        isActive: true,
        plan: latestSub.plan,
        expiresAt: new Date(latestSub.current_period_end),
        daysRemaining: Math.ceil((new Date(latestSub.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
    }

    // Check streaming profile
    if (data.streamingProfile?.subscription_tier !== 'free' && 
        data.streamingProfile?.subscription_expiry && 
        new Date(data.streamingProfile.subscription_expiry) > now) {
      return {
        source: 'streaming_profiles',
        isActive: true,
        plan: data.streamingProfile.subscription_tier,
        expiresAt: new Date(data.streamingProfile.subscription_expiry),
        daysRemaining: Math.ceil((new Date(data.streamingProfile.subscription_expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
    }

    return {
      source: 'none',
      isActive: false,
      plan: null,
      expiresAt: null,
      daysRemaining: 0
    };
  };

  useEffect(() => {
    if (user) {
      fetchAllSubscriptionData();
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Subscription Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view subscription data.</p>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = getCurrentSubscriptionStatus();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Subscription Debugger</CardTitle>
            <Button
              onClick={fetchAllSubscriptionData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Current Status */}
              <Card className={currentStatus?.isActive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardHeader>
                  <CardTitle className="text-lg">Current Subscription Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        currentStatus?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currentStatus?.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </p>
                    {currentStatus?.isActive && (
                      <>
                        <p><strong>Plan:</strong> {currentStatus.plan}</p>
                        <p><strong>Price:</strong> ₹{currentStatus.price}</p>
                        <p><strong>Expires:</strong> {currentStatus.expiresAt?.toLocaleString()}</p>
                        <p><strong>Days Remaining:</strong> {currentStatus.daysRemaining}</p>
                        <p><strong>Data Source:</strong> {currentStatus.source}</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Subscriptions ({data.userSubscriptions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.userSubscriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 text-left p-2">Plan</th>
                            <th className="border border-gray-300 text-left p-2">Price</th>
                            <th className="border border-gray-300 text-left p-2">Status</th>
                            <th className="border border-gray-300 text-left p-2">Start Date</th>
                            <th className="border border-gray-300 text-left p-2">End Date</th>
                            <th className="border border-gray-300 text-left p-2">Days Left</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.userSubscriptions.map((sub, index) => {
                            const daysLeft = Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const isActive = sub.status === 'active' && daysLeft > 0;
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2">
                                  <div>
                                    <div className="font-medium">{sub.subscription_plans?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{sub.subscription_plans?.description}</div>
                                  </div>
                                </td>
                                <td className="border border-gray-300 p-2">₹{sub.subscription_plans?.price || 0}</td>
                                <td className="border border-gray-300 p-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isActive ? 'ACTIVE' : sub.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="border border-gray-300 p-2">{sub.start_date}</td>
                                <td className="border border-gray-300 p-2">{sub.end_date}</td>
                                <td className="border border-gray-300 p-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    daysLeft > 7 ? 'bg-green-100 text-green-800' : 
                                    daysLeft > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No user subscriptions found.</p>
                  )}
                </CardContent>
              </Card>

              {/* Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Orders ({data.orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 text-left p-2">Order ID</th>
                            <th className="border border-gray-300 text-left p-2">Amount</th>
                            <th className="border border-gray-300 text-left p-2">Status</th>
                            <th className="border border-gray-300 text-left p-2">Payment ID</th>
                            <th className="border border-gray-300 text-left p-2">Created</th>
                            <th className="border border-gray-300 text-left p-2">Has Subscription</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.orders.map((order, index) => {
                            const hasSubscription = data.userSubscriptions.some(sub => 
                              Math.abs(new Date(sub.created_at).getTime() - new Date(order.created_at).getTime()) < 60000 // Within 1 minute
                            );
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 text-xs font-mono">{order.order_id}</td>
                                <td className="border border-gray-300 p-2 font-medium">₹{order.amount}</td>
                                <td className="border border-gray-300 p-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                    order.status === 'created' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="border border-gray-300 p-2 text-xs font-mono">{order.payment_id || 'N/A'}</td>
                                <td className="border border-gray-300 p-2">{new Date(order.created_at).toLocaleString()}</td>
                                <td className="border border-gray-300 p-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    hasSubscription ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {hasSubscription ? 'YES' : 'NO'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No orders found.</p>
                  )}
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Subscription Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.subscriptionPlans.map((plan, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-lg">{plan.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        <div className="text-sm space-y-1">
                          <p><strong>Price:</strong> ₹{plan.price}</p>
                          <p><strong>Duration:</strong> {plan.duration_days} days</p>
                          <p><strong>Quality:</strong> {plan.max_quality}</p>
                          <p><strong>Devices:</strong> {plan.max_devices === -1 ? 'Unlimited' : plan.max_devices}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};