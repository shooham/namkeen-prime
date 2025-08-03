import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VideoDebugger: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const testVideo = () => {
    if (!testUrl.trim()) {
      alert('Please enter a video URL');
      return;
    }
    setIsPlaying(true);
  };

  const stopVideo = () => {
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Video URL Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter video URL to test..."
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={testVideo} disabled={!testUrl.trim()}>
            Test Video
          </Button>
          {isPlaying && (
            <Button onClick={stopVideo} variant="outline">
              Stop
            </Button>
          )}
        </div>

        {isPlaying && testUrl && (
          <div className="mt-4">
            <video
              src={testUrl}
              controls
              autoPlay
              className="w-full max-h-96 bg-black"
              onError={(e) => {
                console.error('Video error:', e);
                alert('Failed to load video. Check the URL and CORS settings.');
              }}
              onLoadStart={() => console.log('Video loading started')}
              onCanPlay={() => console.log('Video can play')}
            >
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-600 mt-2">
              Testing URL: {testUrl}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoDebugger;