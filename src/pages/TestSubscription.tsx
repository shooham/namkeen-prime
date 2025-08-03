import React from 'react';
import { SubscriptionButton } from '@/components/SubscriptionButton';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TestSubscription: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎬 Namkeen Prime Subscription
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Test Razorpay Integration
          </p>
          
          {/* User Info */}
          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Logged In
              </h3>
              <p className="text-green-700 mb-4">
                Email: {user.email}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Go to Home
                </Button>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ Login Required
              </h3>
              <p className="text-yellow-700 mb-4">
                Please login to test the subscription functionality
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Login Now
              </Button>
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        <SubscriptionButton />

        {/* Backend Status */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Backend Status
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-blue-700">
              🔧 Backend Server: http://localhost:3001
            </p>
            <p className="text-blue-700 mt-1">
              💳 Razorpay Test Mode: Active
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            How to Test
          </h3>
          <div className="bg-gray-100 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <p className="text-gray-700">Login with your account (if not already logged in)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <p className="text-gray-700">Click on any subscription plan button</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <p className="text-gray-700">Razorpay payment modal will open</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <p className="text-gray-700">Use test card: 4111 1111 1111 1111</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">5</span>
              <p className="text-gray-700">Any future date for expiry, any 3-digit CVV</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSubscription; 