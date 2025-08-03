import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BunnyVideoPlayer from '@/components/BunnyVideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { BUNNY_CONFIG } from '@/config/bunnyConfig';

const VideoDemo = () => {
  const navigate = useNavigate();
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({
    libraryId: BUNNY_CONFIG.DEFAULT_LIBRARY_ID,
    videoId: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_1,
    title: 'Demo Video 1'
  });

  const demoVideos = [
    {
      id: 1,
      title: 'Demo Video 1',
      description: 'Sample video for testing Bunny.net player',
      videoId: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_1,
      thumbnail: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Demo+Video+1'
    },
    {
      id: 2,
      title: 'Demo Video 2',
      description: 'Another sample video for testing',
      videoId: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_2,
      thumbnail: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Demo+Video+2'
    },
    {
      id: 3,
      title: 'Demo Video 3',
      description: 'Third sample video for testing',
      videoId: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_3,
      thumbnail: 'https://via.placeholder.com/300x200/1f2937/ffffff?text=Demo+Video+3'
    }
  ];

  const handlePlayVideo = (video: typeof demoVideos[0]) => {
    setCurrentVideo({
      libraryId: BUNNY_CONFIG.DEFAULT_LIBRARY_ID,
      videoId: video.videoId,
      title: video.title
    });
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
  };

  if (showPlayer) {
    return (
      <BunnyVideoPlayer
        videoLibraryId={currentVideo.libraryId}
        videoId={currentVideo.videoId}
        title={currentVideo.title}
        onClose={handleClosePlayer}
        autoplay={true}
        muted={false}
        loop={false}
        showHeatmap={false}
        rememberPosition={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary/50 backdrop-blur-sm border-b border-border-standard">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-text-primary hover:text-text-primary"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-text-primary">Bunny.net Video Player Demo</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
          <Card className="bg-bg-secondary/50 border-border-standard mb-8">
            <CardHeader>
              <CardTitle className="text-text-primary flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-green" />
                Bunny.net Video Player Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-text-secondary">
              <p>
                This demo showcases the integration of Bunny.net video player into the application. 
                The player uses Bunny Stream's embed iframe with customizable parameters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-text-primary">Features:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Responsive design</li>
                    <li>Custom controls overlay</li>
                    <li>Fullscreen support</li>
                    <li>Volume control</li>
                    <li>Auto-hide controls</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-text-primary">Bunny.net Settings:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Library ID: {BUNNY_CONFIG.DEFAULT_LIBRARY_ID}</li>
                    <li>Autoplay: {BUNNY_CONFIG.PLAYER_SETTINGS.autoplay ? 'Enabled' : 'Disabled'}</li>
                    <li>Remember Position: {BUNNY_CONFIG.PLAYER_SETTINGS.rememberPosition ? 'Enabled' : 'Disabled'}</li>
                    <li>Show Speed Control: {BUNNY_CONFIG.PLAYER_SETTINGS.showSpeed ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Videos */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary">Demo Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-bg-secondary/50 border-border-standard hover:bg-bg-secondary/70 transition-all duration-300 cursor-pointer"
                  onClick={() => handlePlayVideo(video)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 via-transparent to-transparent rounded-t-lg" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        variant="glow" 
                        size="icon" 
                        className="h-12 w-12 rounded-full"
                      >
                        <Play className="h-6 w-6 ml-1" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-text-primary mb-2">{video.title}</h3>
                    <p className="text-text-secondary text-sm">{video.description}</p>
                    <div className="mt-3 text-xs text-text-secondary">
                      Video ID: {video.videoId}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-bg-secondary/50 border-border-standard mt-8">
            <CardHeader>
              <CardTitle className="text-text-primary">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-text-secondary">
              <p>1. Click on any demo video card to start playing</p>
              <p>2. Use the player controls to pause, adjust volume, or go fullscreen</p>
              <p>3. The player will remember your position when you return</p>
              <p>4. To integrate with your own videos, update the video IDs in <code className="bg-bg-primary px-2 py-1 rounded">src/config/bunnyConfig.ts</code></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoDemo; 