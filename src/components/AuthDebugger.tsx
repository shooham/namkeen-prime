import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export const AuthDebugger: React.FC = () => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setSessionInfo({
      hasSession: !!session,
      user: session?.user?.email,
      accessToken: session?.access_token ? 'Present' : 'Missing',
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A',
      error: error?.message
    });
  };

  const testEdgeFunction = async () => {
    setTestResult('Testing...');
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planId: '3300dc04-4a87-4817-a95b-ffb24c095556' }
      });
      
      if (error) {
        setTestResult(`❌ Error: ${error.message}`);
      } else {
        setTestResult(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      setTestResult(`💥 Exception: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔍 Authentication Debugger</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">useAuth Hook:</h3>
          <p>User: {user?.email || 'Not logged in'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Session Info:</h3>
          <pre className="bg-white p-2 rounded text-sm">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <button 
          onClick={testEdgeFunction}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Edge Function
        </button>

        {testResult && (
          <div>
            <h3 className="font-semibold">Test Result:</h3>
            <pre className="bg-white p-2 rounded text-sm whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}

        <button 
          onClick={checkSession}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh Session Info
        </button>
      </div>
    </div>
  );
};