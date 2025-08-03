import React from 'react';
import { SubscriptionDebugger } from '@/components/SubscriptionDebugger';

const SubscriptionDebug: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary py-8">
      <div className="container mx-auto px-4">
        <SubscriptionDebugger />
      </div>
    </div>
  );
};

export default SubscriptionDebug;