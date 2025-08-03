import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paywall } from '@/components/Paywall';

const SubscriptionQuickTest: React.FC = () => {
  const { user } = useAuth();
  const { isSubscribed, plan, expiresAt, isLoading, error, refreshSubscriptionStatus } = useSubscription();
  const { showPaywall, checkAccess, closePaywall } = usePaywall();
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Automatically refresh subscription status when component mounts
      refreshSubscriptionStatus();
    }
  }, [user, refreshSubscriptionStatus]);

  const testVideoAccess = () => {
    const hasAccess = checkAccess('test-series', 'test-episode', 'Test Series');
    setTestResult(hasAccess ? 'ACCESS GRANTED ✅' : 'ACCESS DENIED ❌');
  };

  const testSubscriptionStatus = () => {
    console.log('🧪 Testing subscription status:', {
      user: user?.id,
      isSubscribed,
      plan,
      expiresAt,
      isLoading,
      error
    });
    
    setTestResult(`
      User: ${user?.email || 'Not logged in'}
      Subscribed: ${isSubscribed ? 'YES ✅' : 'NO ❌'}
      Plan: ${plan || 'None'}
      Expires: ${expiresAt ? expiresAt.toLocaleString() : 'N/A'}
      Loading: ${isLoading ? 'YES' : 'NO'}
      Error: ${error || 'None'}
    `);
  };

  return (
    <div className="min-h-screen bg-bg-primary py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Subscription System Quick Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">User Status</h3>
              <p><strong>Logged In:</strong> {user ? 'YES ✅' : 'NO ❌'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            </div>

            {/* Subscription Status */}
            <div className={`p-4 rounded-lg ${isSubscribed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold mb-2">Subscription Status</h3>
              <p><strong>Is Subscribed:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isSubscribed ? 'YES ✅' : 'NO ❌'}
                </span>
              </p>
              <p><strong>Plan:</strong> {plan || 'None'}</p>
              <p><strong>Expires:</strong> {expiresAt ? expiresAt.toLocaleString() : 'N/A'}</p>
              <p><strong>Loading:</strong> {isLoading ? 'YES' : 'NO'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>

            {/* Test Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={refreshSubscriptionStatus}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh Status'}
                </Button>
                
                <Button 
                  onClick={testSubscriptionStatus}
                  variant="outline"
                  className="w-full"
                >
                  Test Subscription
                </Button>
                
                <Button 
                  onClick={testVideoAccess}
                  variant="outline"
                  className="w-full"
                >
                  Test Video Access
                </Button>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result</h3>
                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}

            {/* Expected Results */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold mb-2">⚠️ Current Expected Results (All Data Deleted)</h3>
              <p className="text-sm">
                <strong>All subscription data has been deleted from Supabase</strong><br/>
                <strong>Expected Subscription:</strong> NO ❌<br/>
                <strong>Expected Plan:</strong> None<br/>
                <strong>Expected Expiry:</strong> None<br/>
                <strong>Expected Video Access:</strong> DENIED (Paywall should show) ❌<br/>
                <strong>Expected Paywall:</strong> YES (Should appear when trying to watch videos)
              </p>
            </div>

            {/* Paywall Test */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Paywall Status</h3>
              <p><strong>Paywall Showing:</strong> {showPaywall ? 'YES ❌' : 'NO ✅'}</p>
              <p className="text-sm text-gray-600 mt-2">
                If you're a paid user, the paywall should NOT be showing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Paywall Modal */}
        {showPaywall && (
          <Paywall
            seriesTitle="Test Series"
            onClose={closePaywall}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionQuickTest;