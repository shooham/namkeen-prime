import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, Settings, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUNNY_CONFIG } from '@/config/bunnyConfig';

interface BunnyVideoPlayerProps {
  videoLibraryId: string;
  videoId: string;
  title?: string;
  onClose?: () => void;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showHeatmap?: boolean;
  rememberPosition?: boolean;
  className?: string;
}

const BunnyVideoPlayer: React.FC<BunnyVideoPlayerProps> = ({
  videoLibraryId,
  videoId,
  title,
  onClose,
  autoplay = true,
  muted = false,
  loop = false,
  showHeatmap = false,
  rememberPosition = true,
  className
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(true);

  // Build the embed URL with parameters
  const buildEmbedUrl = () => {
    const baseUrl = `${BUNNY_CONFIG.EMBED_BASE_URL}/${videoLibraryId}/${videoId}`;
    const params = new URLSearchParams();
    
    // Add default settings
    Object.entries(BUNNY_CONFIG.PLAYER_SETTINGS).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        params.append(key, value.toString());
      }
    });
    
    // Override with props
    if (autoplay) params.append('autoplay', 'true');
    if (isMuted) params.append('muted', 'true');
    if (loop) params.append('loop', 'true');
    if (showHeatmap) params.append('showHeatmap', 'true');
    if (rememberPosition) params.append('rememberPosition', 'true');
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls]);

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black flex items-center justify-center",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Responsive iframe container */}
        <div className="relative w-full h-full">
          <iframe
            src={buildEmbedUrl()}
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Custom Controls Overlay */}
        {showControls && (
          <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center space-x-2">
                {title && (
                  <h2 className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded">
                    {title}
                  </h2>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BunnyVideoPlayer; 