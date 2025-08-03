import React from 'react';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary pb-16 md:pb-0">
      <Navigation isAuthenticated={true} />
      <MobileBottomNav isAuthenticated={true} />

      {/* Header */}
      <div className="bg-bg-secondary/30 border-b border-border-standard">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-text-primary">
                {title}
              </h1>
              {subtitle && (
                <p className="text-text-secondary mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout; 