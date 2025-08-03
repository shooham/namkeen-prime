import React, { useState } from 'react';
import SettingsLayout from '@/components/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, EyeOff, Users, Lock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PrivacySettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    watchHistory: true,
    recommendations: true,
    activityStatus: false,
    dataCollection: true,
    marketingEmails: false,
    thirdPartySharing: false,
    locationSharing: false
  });

  const handleToggle = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelectChange = (setting: string, value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout 
      title="Privacy Settings" 
      subtitle="Control your privacy and data sharing preferences"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Privacy */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-green" />
              Profile Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Profile Visibility</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Control who can see your profile information
                </p>
              </div>
              <Select 
                value={privacySettings.profileVisibility} 
                onValueChange={(value) => handleSelectChange('profileVisibility', value)}
              >
                <SelectTrigger className="w-48 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Activity Status</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Show when you're online and watching content
                </p>
              </div>
              <Switch
                checked={privacySettings.activityStatus}
                onCheckedChange={() => handleToggle('activityStatus')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Analytics */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary-green" />
              Data & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Watch History</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Save your viewing history for personalized recommendations
                </p>
              </div>
              <Switch
                checked={privacySettings.watchHistory}
                onCheckedChange={() => handleToggle('watchHistory')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Personalized Recommendations</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Use your data to suggest content you might like
                </p>
              </div>
              <Switch
                checked={privacySettings.recommendations}
                onCheckedChange={() => handleToggle('recommendations')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Data Collection</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Allow us to collect usage data to improve our service
                </p>
              </div>
              <Switch
                checked={privacySettings.dataCollection}
                onCheckedChange={() => handleToggle('dataCollection')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Eye className="h-5 w-5 mr-2 text-primary-green" />
              Communication & Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Marketing Emails</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Receive promotional emails about new content and features
                </p>
              </div>
              <Switch
                checked={privacySettings.marketingEmails}
                onCheckedChange={() => handleToggle('marketingEmails')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Third-Party Data Sharing</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Allow sharing of anonymized data with trusted partners
                </p>
              </div>
              <Switch
                checked={privacySettings.thirdPartySharing}
                onCheckedChange={() => handleToggle('thirdPartySharing')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Location Sharing</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Share your location for regional content recommendations
                </p>
              </div>
              <Switch
                checked={privacySettings.locationSharing}
                onCheckedChange={() => handleToggle('locationSharing')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Lock className="h-5 w-5 mr-2 text-primary-green" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Download My Data</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Get a copy of all your personal data
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-border-standard text-text-primary">
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Delete Account</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary-green hover:bg-primary-green/90 text-bg-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default PrivacySettings; 