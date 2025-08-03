import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SubscriptionTest: React.FC = () => {
  const { user } = useAuth();
  const { isSubscribed, plan, expiresAt, isLoading, error, refreshSubscriptionStatus } = useSubscription();

  return (
    <div className="min-h-screen bg-bg-primary py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">User Information</h3>
              <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
              <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Subscription Status</h3>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Is Subscribed:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isSubscribed ? 'YES' : 'NO'}
                  </span>
                </p>
                <p><strong>Plan:</strong> {plan || 'None'}</p>
                <p><strong>Expires At:</strong> {expiresAt ? expiresAt.toLocaleString() : 'N/A'}</p>
                <p><strong>Error:</strong> {error || 'None'}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={refreshSubscriptionStatus}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Subscription Status'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Expected Result</h3>
              <p className="text-sm text-gray-600">
                For user ID: 7c17e8c3-ec01-414a-89ae-32297919f182<br/>
                Expected: <strong>Is Subscribed: YES</strong><br/>
                Expected Plan: <strong>3 Month</strong><br/>
                Expected Expiry: <strong>2025-10-30</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionTest;