import React, { useState } from 'react';
import SettingsLayout from '@/components/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Camera, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const EditProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get user data from Google metadata
  const getUserDisplayName = () => {
    if (!user) return '';
    const metadata = user.user_metadata;
    return metadata?.full_name || metadata?.name || '';
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  const getUserAvatar = () => {
    if (!user) return null;
    const metadata = user.user_metadata;
    return metadata?.avatar_url || metadata?.picture || null;
  };

  const [formData, setFormData] = useState({
    firstName: getUserDisplayName().split(' ')[0] || '',
    lastName: getUserDisplayName().split(' ').slice(1).join(' ') || '',
    email: getUserEmail(),
    bio: 'Passionate about cutting-edge technology and futuristic storytelling.',
    location: 'Mumbai, India',
    website: '',
    phone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout 
      title="Edit Profile" 
      subtitle="Update your personal information and preferences"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Picture Section */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Camera className="h-5 w-5 mr-2 text-primary-green" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {getUserAvatar() ? (
                  <img 
                    src={getUserAvatar()} 
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-green/30"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-green to-accent-glow rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-bg-primary" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-2">
                  Upload a new profile picture
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Upload Photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-green" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-text-primary">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="bg-bg-primary border-border-standard text-text-primary"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-text-primary">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="bg-bg-primary border-border-standard text-text-primary"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-text-primary flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-bg-primary/50 border-border-standard text-text-secondary"
              />
              <p className="text-xs text-text-secondary mt-1">
                Email cannot be changed as it's linked to your Google account
              </p>
            </div>

            <div>
              <Label htmlFor="bio" className="text-text-primary">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="bg-bg-primary border-border-standard text-text-primary"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="text-text-primary">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-bg-primary border-border-standard text-text-primary"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-text-primary">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-bg-primary border-border-standard text-text-primary"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="text-text-primary">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="bg-bg-primary border-border-standard text-text-primary"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" className="border-border-standard text-text-primary">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary-green hover:bg-primary-green/90 text-bg-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default EditProfile; 