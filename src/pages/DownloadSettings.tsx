import React, { useState } from 'react';
import SettingsLayout from '@/components/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Download, Wifi, HardDrive, Settings, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DownloadSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [downloadSettings, setDownloadSettings] = useState({
    autoDownload: false,
    wifiOnly: true,
    quality: 'hd',
    maxStorage: '5',
    downloadLocation: 'default',
    backgroundDownload: true,
    deleteAfterWatching: false
  });

  const [downloadQueue] = useState([
    {
      id: '1',
      title: 'Neural Networks - Episode 5',
      size: '1.2 GB',
      progress: 75,
      status: 'downloading'
    },
    {
      id: '2',
      title: 'Cyber Revolution - Episode 3',
      size: '980 MB',
      progress: 100,
      status: 'completed'
    },
    {
      id: '3',
      title: 'Space Odyssey 2024 - Episode 1',
      size: '1.5 GB',
      progress: 0,
      status: 'queued'
    }
  ]);

  const handleToggle = (setting: string) => {
    setDownloadSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSelectChange = (setting: string, value: string) => {
    setDownloadSettings(prev => ({
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
        title: "Settings Updated",
        description: "Your download preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update download settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearDownloads = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Downloads Cleared",
        description: "All downloaded content has been removed.",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear downloads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloading':
        return <Play className="h-4 w-4 text-primary-green" />;
      case 'completed':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'queued':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Download className="h-4 w-4 text-text-secondary" />;
    }
  };

  return (
    <SettingsLayout 
      title="Download Settings" 
      subtitle="Manage your offline viewing preferences and downloads"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Download Preferences */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary-green" />
              Download Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Auto Download</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically download new episodes of your favorite series
                </p>
              </div>
              <Switch
                checked={downloadSettings.autoDownload}
                onCheckedChange={() => handleToggle('autoDownload')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">WiFi Only</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Only download content when connected to WiFi
                </p>
              </div>
              <Switch
                checked={downloadSettings.wifiOnly}
                onCheckedChange={() => handleToggle('wifiOnly')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Background Downloads</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Continue downloading when app is in background
                </p>
              </div>
              <Switch
                checked={downloadSettings.backgroundDownload}
                onCheckedChange={() => handleToggle('backgroundDownload')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-text-primary font-medium">Delete After Watching</Label>
                <p className="text-sm text-text-secondary mt-1">
                  Automatically remove downloaded content after viewing
                </p>
              </div>
              <Switch
                checked={downloadSettings.deleteAfterWatching}
                onCheckedChange={() => handleToggle('deleteAfterWatching')}
                className="data-[state=checked]:bg-primary-green"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quality & Storage */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-primary-green" />
              Quality & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-text-primary font-medium">Download Quality</Label>
              <Select 
                value={downloadSettings.quality} 
                onValueChange={(value) => handleSelectChange('quality', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="sd">Standard Definition (SD)</SelectItem>
                  <SelectItem value="hd">High Definition (HD)</SelectItem>
                  <SelectItem value="fhd">Full HD (1080p)</SelectItem>
                  <SelectItem value="uhd">Ultra HD (4K)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-text-primary font-medium">Maximum Storage (GB)</Label>
              <Input
                type="number"
                value={downloadSettings.maxStorage}
                onChange={(e) => handleSelectChange('maxStorage', e.target.value)}
                className="mt-2 bg-bg-primary border-border-standard text-text-primary"
                min="1"
                max="50"
              />
              <p className="text-xs text-text-secondary mt-1">
                Current usage: 3.2 GB / {downloadSettings.maxStorage} GB
              </p>
            </div>

            <div>
              <Label className="text-text-primary font-medium">Download Location</Label>
              <Select 
                value={downloadSettings.downloadLocation} 
                onValueChange={(value) => handleSelectChange('downloadLocation', value)}
              >
                <SelectTrigger className="w-full mt-2 bg-bg-primary border-border-standard text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border-standard">
                  <SelectItem value="default">Default Downloads Folder</SelectItem>
                  <SelectItem value="custom">Custom Location</SelectItem>
                  <SelectItem value="external">External Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Download Queue */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-text-primary flex items-center">
                <Download className="h-5 w-5 mr-2 text-primary-green" />
                Download Queue
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearDownloads}
                disabled={loading}
                className="border-border-standard text-text-primary"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {downloadQueue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-bg-primary/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-text-primary font-medium">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24">
                      <Progress value={item.progress} className="h-2" />
                    </div>
                    <span className="text-sm text-text-secondary w-12 text-right">
                      {item.progress}%
                    </span>
                    <Button variant="ghost" size="sm">
                      {item.status === 'downloading' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card className="bg-bg-secondary/50 border-border-standard">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-primary-green" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-primary">Used Space</span>
                <span className="text-text-primary font-medium">3.2 GB / 5 GB</span>
              </div>
              <Progress value={64} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-text-secondary">
                  <span className="text-primary-green">2.1 GB</span> - Downloaded Series
                </div>
                <div className="text-text-secondary">
                  <span className="text-primary-green">1.1 GB</span> - Downloaded Movies
                </div>
              </div>
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
            <Settings className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default DownloadSettings; 