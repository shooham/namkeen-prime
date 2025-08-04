import React from 'react';
import { AuthDebugger } from '@/components/AuthDebugger';

const AuthDebug: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication Debug</h1>
        <AuthDebugger />
      </div>
    </div>
  );
};

export default AuthDebug;