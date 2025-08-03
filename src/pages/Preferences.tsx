import React, { useState } from 'react';
import SettingsLayout from '@/components/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Monitor, Volume2, Languages, Moon, Sun, Palette, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Preferences = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    // Video Preferences
    defaultQuality: 'auto',
    autoplay: true,
    autoNextEpisode: true,
    skipIntro: true,
    skipCredits: false,
    
    // Audio Preferences
    defaultVolume: 80,
    audioLanguage: 'english',
    subtitles: true,
    subtitleLanguage: 'english',
    
    // Interface Preferences
    theme: 'dark',
    language: 'english',
    autoPlayTrailers: false,
    showContentWarnings: true,
    
    // Accessibility
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    audioDescriptions: false
  });

  const handleToggle = (setting: string) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelectChange = (setting: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSliderChange = (setting: string, value: number[]) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value[0]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset to default values
      setPreferences({
        defaultQuality: 'auto',
        autoplay: true,
        autoNextEpisode: true,
        skipIntro: true,
        skipCredits: false,
        defaultVolume: 80,
        audioLanguage: 'english',
        subtitles: true,
        subtitleLanguage: 'english',
        theme: 'dark',
        language: 'english',
        autoPlayTrailers: false,
        showContentWarnings: true,
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        audioDescriptions: false
      });
      
      toast({
        title: "Preferences Reset",
        description: "All preferences have been reset to default values.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout 
      title="Preferences" 
      subtitle="Customize your viewing experience and app settings"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Video Preferences */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-primary-green" />
              Video Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-text-primary font-medium">Default Video Quality</Label>
              <Select 
                value={preferences.defaultQuality} 
                onValueChange={(value) => handleSelectChange('defaultQuality', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="auto">Auto (Recommended)</SelectItem>
                  <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                  <SelectItem value="720p">HD (720p)</SelectItem>
                  <SelectItem value="480p">SD (480p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Autoplay</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically start playing content when selected
                </p>
              </div>
              <Switch
                checked={preferences.autoplay}
                onCheckedChange={() => handleToggle('autoplay')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Auto Next Episode</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically play the next episode in a series
                </p>
              </div>
              <Switch
                checked={preferences.autoNextEpisode}
                onCheckedChange={() => handleToggle('autoNextEpisode')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Skip Intro</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically skip show intros when available
                </p>
              </div>
              <Switch
                checked={preferences.skipIntro}
                onCheckedChange={() => handleToggle('skipIntro')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Skip Credits</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically skip end credits
                </p>
              </div>
              <Switch
                checked={preferences.skipCredits}
                onCheckedChange={() => handleToggle('skipCredits')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio & Subtitles */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Volume2 className="h-5 w-5 mr-2 text-primary-green" />
              Audio & Subtitles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-text-primary font-medium">Default Volume</Label>
              <div className="mt-2 space-y-2">
                <Slider
                  value={[preferences.defaultVolume]}
                  onValueChange={(value) => handleSliderChange('defaultVolume', value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>0%</span>
                  <span>{preferences.defaultVolume}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-text-primary font-medium">Audio Language</Label>
              <Select 
                value={preferences.audioLanguage} 
                onValueChange={(value) => handleSelectChange('audioLanguage', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Subtitles</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Show subtitles by default
                </p>
              </div>
              <Switch
                checked={preferences.subtitles}
                onCheckedChange={() => handleToggle('subtitles')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div>
              <Label className="text-text-primary font-medium">Subtitle Language</Label>
              <Select 
                value={preferences.subtitleLanguage} 
                onValueChange={(value) => handleSelectChange('subtitleLanguage', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interface Preferences */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Palette className="h-5 w-5 mr-2 text-primary-green" />
              Interface Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-text-primary font-medium">Theme</Label>
              <Select 
                value={preferences.theme} 
                onValueChange={(value) => handleSelectChange('theme', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="dark">Dark Theme</SelectItem>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-text-primary font-medium">Language</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">हिंदी</SelectItem>
                  <SelectItem value="spanish">Español</SelectItem>
                  <SelectItem value="french">Français</SelectItem>
                  <SelectItem value="german">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Auto-play Trailers</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically play trailers for content
                </p>
              </div>
              <Switch
                checked={preferences.autoPlayTrailers}
                onCheckedChange={() => handleToggle('autoPlayTrailers')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Content Warnings</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Show content warnings before sensitive content
                </p>
              </div>
              <Switch
                checked={preferences.showContentWarnings}
                onCheckedChange={() => handleToggle('showContentWarnings')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Languages className="h-5 w-5 mr-2 text-primary-green" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">High Contrast</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                checked={preferences.highContrast}
                onCheckedChange={() => handleToggle('highContrast')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Reduced Motion</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Reduce animations and motion effects
                </p>
              </div>
              <Switch
                checked={preferences.reducedMotion}
                onCheckedChange={() => handleToggle('reducedMotion')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Large Text</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Increase text size for better readability
                </p>
              </div>
              <Switch
                checked={preferences.largeText}
                onCheckedChange={() => handleToggle('largeText')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Audio Descriptions</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Enable audio descriptions when available
                </p>
              </div>
              <Switch
                checked={preferences.audioDescriptions}
                onCheckedChange={() => handleToggle('audioDescriptions')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="border-border-standard text-text-primary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary-green hover:bg-primary-green/90 text-bg-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default Preferences; 