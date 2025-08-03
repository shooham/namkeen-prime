import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePayment } from '@/hooks/usePayment';

export const DebugPaymentTest: React.FC = () => {
  const { user } = useAuth();
  const { initiatePayment, loading } = usePayment();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPaymentFlow = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      addLog('🧪 === STARTING PAYMENT FLOW TEST ===');
      
      // Test 1: User authentication
      addLog(`👤 User check: ${user?.email || 'No user logged in'}`);
      if (!user) {
        addLog('❌ Test failed: No user logged in');
        return;
      }

      // Test 2: Product data
      const testProduct = {
        id: 'f720b8a6-6120-4867-9108-4ca4988bdd9f',
        name: 'Mini Plan',
        price: 99,
        duration: 30
      };
      addLog(`📦 Test product: ${JSON.stringify(testProduct)}`);

      // Test 3: Environment variables
      addLog(`🔗 Supabase URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
      addLog(`🔗 Razorpay Key: ${import.meta.env.VITE_RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing'}`);

      // Test 4: Razorpay SDK
      if (typeof window !== 'undefined' && window.Razorpay) {
        addLog('✅ Razorpay SDK loaded');
      } else {
        addLog('❌ Razorpay SDK not loaded');
      }

      // Test 5: Edge Function connectivity
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: testProduct.id,
            user_id: user.id
          })
        });
        
        const data = await response.json();
        addLog(`📊 Edge Function response: ${response.status} - ${response.ok ? '✅ Success' : '❌ Failed'}`);
        
        if (response.ok) {
          addLog(`🎯 Order created: ${data.order_id}`);
          
          // Test 6: Razorpay initialization
          try {
            const options = {
              key: data.key,
              amount: data.amount,
              currency: data.currency,
              name: 'Namkeen Prime',
              description: testProduct.name,
              order_id: data.order_id,
              prefill: {
                name: user.user_metadata?.full_name || 'User',
                email: user.email,
              },
              handler: (response: any) => {
                addLog(`✅ Payment successful: ${response.razorpay_payment_id}`);
              },
              modal: {
                ondismiss: () => {
                  addLog('❌ Payment cancelled');
                }
              }
            };

            const rzp = new window.Razorpay(options);
            addLog('✅ Razorpay instance created successfully');
            
            // Open the popup
            rzp.open();
            addLog('🎯 Razorpay popup opened');
            
          } catch (error) {
            addLog(`❌ Razorpay error: ${error.message}`);
          }
        } else {
          addLog(`❌ Edge Function error: ${data.error || 'Unknown error'}`);
        }
        
      } catch (error) {
        addLog(`❌ Edge Function connection failed: ${error.message}`);
      }

    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🧪 Payment Debug Tool</h3>
      
      <button
        onClick={testPaymentFlow}
        disabled={isTesting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test Payment Flow'}
      </button>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Test Results:</h4>
        <div className="bg-black text-green-400 p-2 rounded text-xs font-mono max-h-64 overflow-y-auto">
          {testResults.length === 0 ? 'Click test button to start...' : testResults.map((result, index) => (
            <div key={index}>{result}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
