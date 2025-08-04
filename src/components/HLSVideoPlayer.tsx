import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  SkipForward,
  SkipBack,
  Rewind,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface HLSVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  autoPlayNext?: boolean;
  title?: string;
}

export const HLSVideoPlayer: React.FC<HLSVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  onNext,
  onPrevious,
  autoPlayNext = false,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);

  // Basic video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailTime, setThumbnailTime] = useState(0);
  const [thumbnailPosition, setThumbnailPosition] = useState({ x: 0, y: 0 });

  // Advanced features
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [availableQualities, setAvailableQualities] = useState<Array<{ level: number, height: number, bitrate: number }>>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 for auto
  const [isOrientationLocked, setIsOrientationLocked] = useState(false);
  const [bufferedRanges, setBufferedRanges] = useState<TimeRanges | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [keyboardFeedback, setKeyboardFeedback] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Playback speeds
  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Utility functions
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showFeedback = (message: string) => {
    setKeyboardFeedback(message);
    setTimeout(() => setKeyboardFeedback(null), 2000);
  };

  // Video control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('🎬 HLS Player: Play error:', err);
        setError('Failed to play video');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume / 100;
    setVolume([newVolume]);

    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('🎬 HLS Player: Exit fullscreen error:', err);
      });
    } else {
      // Try different fullscreen methods for better mobile support
      const requestFullscreen = container.requestFullscreen || 
                               (container as any).webkitRequestFullscreen || 
                               (container as any).mozRequestFullScreen || 
                               (container as any).msRequestFullscreen;
      
      if (requestFullscreen) {
        requestFullscreen.call(container).catch((err: any) => {
          console.error('🎬 HLS Player: Fullscreen error:', err);
          
          // Fallback for mobile devices - try video element fullscreen
          if (isMobile && video.webkitEnterFullscreen) {
            try {
              video.webkitEnterFullscreen();
            } catch (videoErr) {
              console.error('🎬 HLS Player: Video fullscreen error:', videoErr);
            }
          }
        });
      } else if (isMobile && video.webkitEnterFullscreen) {
        // iOS Safari fallback
        try {
          video.webkitEnterFullscreen();
        } catch (err) {
          console.error('🎬 HLS Player: iOS fullscreen error:', err);
        }
      }
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const changeQuality = (level: number) => {
    if (!hlsRef.current) return;

    hlsRef.current.currentLevel = level;
    setCurrentQuality(level);
  };

  const toggleOrientationLock = () => {
    if ('screen' in window && 'orientation' in window.screen) {
      if (isOrientationLocked) {
        (window.screen.orientation as any).unlock?.();
      } else {
        (window.screen.orientation as any).lock?.('landscape').catch(() => {
          console.log('Orientation lock not supported');
        });
      }
      setIsOrientationLocked(!isOrientationLocked);
    }
  };

  const rotateVideo = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  const checkMobileDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const isLandscapeNow = window.innerWidth > window.innerHeight;
    
    setIsMobile(isMobileDevice || isSmallScreen);
    setIsLandscape(isLandscapeNow);
    
    // Auto-show controls on mobile when orientation changes
    if (isMobileDevice && isLandscapeNow !== isLandscape) {
      setTimeout(() => {
        setShowMobileControls(true);
        setShowControls(true);
      }, 100);
    }
  };

  const toggleMobileControls = () => {
    if (isMobile) {
      setShowMobileControls(true);
      setShowControls(true);
      
      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Auto-hide after 3 seconds if playing
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowMobileControls(false);
          setShowControls(false);
        }, 3000);
      }
    }
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };

  // Thumbnail preview on seek
  const handleSeekHover = (event: React.MouseEvent) => {
    const video = videoRef.current;
    const canvas = thumbnailCanvasRef.current;
    if (!video || !canvas || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;

    setThumbnailTime(time);
    setThumbnailPosition({ x: event.clientX, y: event.clientY - 100 });
    setShowThumbnail(true);

    // Generate thumbnail (simplified - in production you'd want proper thumbnails)
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 160;
      canvas.height = 90;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  };

  const handleSeekLeave = () => {
    setShowThumbnail(false);
  };

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isMobile) {
      setShowMobileControls(true);
    }
    
    // Only auto-hide if playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        if (isMobile) {
          setShowMobileControls(false);
        }
      }, isMobile ? 4000 : 3000); // Longer timeout for mobile
    }
  }, [isPlaying, isMobile]);

  // Handle mouse movement to show controls
  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Mobile device detection and orientation handling
  useEffect(() => {
    checkMobileDevice();
    
    const handleResize = () => {
      checkMobileDevice();
    };
    
    const handleOrientationChange = () => {
      // Reset controls visibility on orientation change
      setTimeout(() => {
        resetControlsTimeout();
      }, 100);
    };
    
    // Add null check before adding event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleOrientationChange);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, [resetControlsTimeout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      // Prevent default behavior for video controls
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return; // Don't handle shortcuts when typing in inputs
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          togglePlay();
          showFeedback(isPlaying ? 'Paused' : 'Playing');
          break;
        case 'KeyK':
          event.preventDefault();
          togglePlay();
          showFeedback(isPlaying ? 'Paused' : 'Playing');
          break;
        case 'KeyM':
          event.preventDefault();
          toggleMute();
          showFeedback(isMuted ? 'Unmuted' : 'Muted');
          break;
        case 'KeyF':
          event.preventDefault();
          toggleFullscreen();
          showFeedback(isFullscreen ? 'Exit Fullscreen' : 'Fullscreen');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          skip(-10);
          showFeedback('Skipped back 10s');
          break;
        case 'ArrowRight':
          event.preventDefault();
          skip(10);
          showFeedback('Skipped forward 10s');
          break;
        case 'ArrowUp':
          event.preventDefault();
          const newVolumeUp = Math.min(100, volume[0] + 10);
          handleVolumeChange([newVolumeUp]);
          showFeedback(`Volume: ${newVolumeUp}%`);
          break;
        case 'ArrowDown':
          event.preventDefault();
          const newVolumeDown = Math.max(0, volume[0] - 10);
          handleVolumeChange([newVolumeDown]);
          showFeedback(`Volume: ${newVolumeDown}%`);
          break;
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          event.preventDefault();
          const digit = parseInt(event.code.slice(-1));
          const seekTime = (digit / 10) * duration;
          video.currentTime = seekTime;
          setCurrentTime(seekTime);
          break;
        case 'Comma':
          event.preventDefault();
          const newSpeedDown = Math.max(0.25, playbackSpeed - 0.25);
          changePlaybackSpeed(newSpeedDown);
          showFeedback(`Speed: ${newSpeedDown}x`);
          break;
        case 'Period':
          event.preventDefault();
          const newSpeedUp = Math.min(2, playbackSpeed + 0.25);
          changePlaybackSpeed(newSpeedUp);
          showFeedback(`Speed: ${newSpeedUp}x`);
          break;
        case 'Slash':
          event.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
        case 'KeyR':
          event.preventDefault();
          rotateVideo();
          showFeedback(`Rotated to ${(rotation + 90) % 360}°`);
          break;
      }
    };

    // Add null check before adding event listener
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [togglePlay, toggleMute, toggleFullscreen, skip, volume, handleVolumeChange, duration, playbackSpeed, changePlaybackSpeed, showKeyboardHelp, rotation, rotateVideo]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!(document.fullscreenElement || 
                                 (document as any).webkitFullscreenElement || 
                                 (document as any).mozFullScreenElement || 
                                 (document as any).msFullscreenElement);
      setIsFullscreen(isFullscreenNow);
      
      // Show controls when entering/exiting fullscreen
      if (isFullscreenNow || !isFullscreenNow) {
        resetControlsTimeout();
      }
    };

    // Add null check before adding event listener
    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }
  }, [resetControlsTimeout]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    console.log('🎬 HLS Player: Initializing with URL:', src);
    setIsLoading(true);
    setError(null);

    // Check if the URL is an HLS stream (.m3u8)
    const isHLS = src.includes('.m3u8') || src.includes('playlist.m3u8');

    if (isHLS && Hls.isSupported()) {
      console.log('🎬 HLS Player: Using HLS.js for streaming');

      // Create HLS instance
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsRef.current = hls;

      // Load the source
      hls.loadSource(src);
      hls.attachMedia(video);

      // HLS events
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('🎬 HLS Player: Manifest parsed successfully');
        setIsLoading(false);

        // Extract available quality levels
        const levels = data.levels.map((level: any, index: number) => ({
          level: index,
          height: level.height,
          bitrate: level.bitrate
        }));
        setAvailableQualities(levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('🎬 HLS Player Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error: Unable to load video stream');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error: Video format not supported');
              break;
            default:
              setError('Fatal error: Unable to play video');
              break;
          }
        }
      });

    } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('🎬 HLS Player: Using native HLS support (Safari)');
      video.src = src;
      setIsLoading(false);
    } else if (!isHLS) {
      console.log('🎬 HLS Player: Using native video for MP4');
      video.src = src;
      setIsLoading(false);
    } else {
      setError('HLS not supported in this browser');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      video.playbackRate = playbackSpeed;
      console.log('🎬 HLS Player: Video metadata loaded, duration:', video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setBufferedRanges(video.buffered);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      resetControlsTimeout();
      console.log('🎬 HLS Player: Video started playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      console.log('🎬 HLS Player: Video paused');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (autoPlayNext && onNext) {
        setTimeout(() => onNext(), 1000);
      }
    };

    const handleError = (e: Event) => {
      console.error('🎬 HLS Player: Video element error:', e);
      setError('Failed to load video');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('🎬 HLS Player: Video can start playing');
    };

    const handleProgress = () => {
      setBufferedRanges(video.buffered);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);

    return () => {
      // Add null check before removing event listeners
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('progress', handleProgress);
      }
    };
  }, [playbackSpeed, autoPlayNext, onNext, resetControlsTimeout]);
  if (error) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-64 bg-gray-900">
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">Video Error</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400 mb-4">Please try refreshing or contact support</p>
            <Button onClick={retry} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className} ${isMobile ? 'mobile-video-container' : ''} ${isFullscreen ? 'fixed inset-0 z-50 rounded-none mobile-video-fullscreen' : ''}`}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseLeave={!isMobile ? () => !isPlaying && setShowControls(true) : undefined}
      onClick={isMobile ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileControls();
      } : undefined}
      onTouchStart={isMobile ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileControls();
      } : undefined}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
        playsInline
        preload="metadata"
        controls={false}
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        onClick={isMobile ? undefined : togglePlay}
        onTouchEnd={isMobile ? (e) => {
          e.preventDefault();
          toggleMobileControls();
        } : undefined}
      />

      {/* Hidden canvas for thumbnails */}
      <canvas ref={thumbnailCanvasRef} className="hidden" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}

      {/* Thumbnail preview */}
      {showThumbnail && (
        <div
          className="absolute z-40 pointer-events-none bg-black border border-white/20 rounded"
          style={{
            left: thumbnailPosition.x - 80,
            top: thumbnailPosition.y - 100,
            transform: 'translateX(-50%)'
          }}
        >
          <canvas
            ref={thumbnailCanvasRef}
            className="rounded"
            width={160}
            height={90}
          />
          <div className="text-white text-xs text-center py-1">
            {formatTime(thumbnailTime)}
          </div>
        </div>
      )}

      {/* Keyboard feedback */}
      {keyboardFeedback && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {keyboardFeedback}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      {showKeyboardHelp && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
          <div className="bg-black/90 border border-white/20 rounded-lg p-6 max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-300">
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Space/K</kbd> Play/Pause</div>
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">←/→</kbd> Skip ±10s</div>
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">↑/↓</kbd> Volume ±10%</div>
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">R</kbd> Rotate Video</div>
              </div>
              <div className="text-gray-300">
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">M</kbd> Mute</div>
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">F</kbd> Fullscreen</div>
                <div className="mb-2"><kbd className="bg-gray-700 px-2 py-1 rounded text-xs">,/.</kbd> Speed ±0.25x</div>
              </div>
            </div>
            <Button
              onClick={() => setShowKeyboardHelp(false)}
              variant="outline"
              className="mt-4 w-full text-white border-white hover:bg-white hover:text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>

        {/* Seek bar */}
        <div className={`${isMobile ? 'px-2 py-1' : 'p-4'} mb-2`}>
          <div
            className="relative"
            onMouseMove={handleSeekHover}
            onMouseLeave={handleSeekLeave}
          >
            {/* Buffer indicator */}
            {bufferedRanges && (
              <div className="absolute inset-0 flex items-center">
                {Array.from({ length: bufferedRanges.length }, (_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white/30 h-1 rounded"
                    style={{
                      left: `${(bufferedRanges.start(i) / duration) * 100}%`,
                      width: `${((bufferedRanges.end(i) - bufferedRanges.start(i)) / duration) * 100}%`,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                ))}
              </div>
            )}

            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full relative z-10"
            />
          </div>

          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Controls */}
        {!isMobile && (
          <div className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Previous episode */}
                {onPrevious && (
                  <Button
                    onClick={onPrevious}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                )}

                {/* Skip backward */}
                <Button
                  onClick={() => skip(-10)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Rewind className="w-4 h-4" />
                  <span className="text-xs ml-1">10</span>
                </Button>

                {/* Play/Pause */}
                <Button
                  onClick={togglePlay}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 w-10 h-10"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                {/* Skip forward */}
                <Button
                  onClick={() => skip(10)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <span className="text-xs mr-1">10</span>
                  <SkipForward className="w-4 h-4" />
                </Button>

                {/* Next episode */}
                {onNext && (
                  <Button
                    onClick={onNext}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                )}

                {/* Volume */}
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <div className="w-20">
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Current time / Duration */}
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Playback speed */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 text-xs"
                    >
                      {playbackSpeed}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {playbackSpeeds.map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className={`text-white hover:bg-white/20 ${speed === playbackSpeed ? 'bg-white/10' : ''}`}
                      >
                        {speed}x {speed === 1 && '(Normal)'}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quality selector */}
                {availableQualities.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20 text-xs"
                      >
                        {currentQuality === -1 ? 'Auto' : `${availableQualities[currentQuality]?.height}p`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Quality</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => changeQuality(-1)}
                        className={`text-white hover:bg-white/20 ${currentQuality === -1 ? 'bg-white/10' : ''}`}
                      >
                        Auto
                      </DropdownMenuItem>
                      {availableQualities.map((quality) => (
                        <DropdownMenuItem
                          key={quality.level}
                          onClick={() => changeQuality(quality.level)}
                          className={`text-white hover:bg-white/20 ${quality.level === currentQuality ? 'bg-white/10' : ''}`}
                        >
                          {quality.height}p
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Orientation lock */}
                {typeof window !== 'undefined' && 'screen' in window && (
                  <Button
                    onClick={toggleOrientationLock}
                    size="sm"
                    variant="ghost"
                    className={`text-white hover:bg-white/20 ${isOrientationLocked ? 'bg-white/10' : ''}`}
                  >
                    {isOrientationLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                )}

                {/* Rotation */}
                <Button
                  onClick={rotateVideo}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  title={`Rotate (${rotation}°)`}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Settings */}
                <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-white hover:bg-white/20">
                      Auto Play Next: {autoPlayNext ? 'On' : 'Off'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/20">
                      Loop: Off
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowKeyboardHelp(true)}
                      className="text-white hover:bg-white/20"
                    >
                      Keyboard Shortcuts (?)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Fullscreen */}
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        {isMobile && showMobileControls && (
          <div className="px-2 pb-2">
            {/* Primary Controls Row */}
            <div className="flex items-center justify-between mb-2">
              {/* Left side - Play/Pause and Skip */}
              <div className="flex items-center space-x-3">
                {/* Skip backward */}
                <Button
                  onClick={() => skip(-10)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Rewind className="w-5 h-5" />
                </Button>

                {/* Play/Pause */}
                <Button
                  onClick={togglePlay}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 w-12 h-12"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                {/* Skip forward */}
                <Button
                  onClick={() => skip(10)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Right side - Volume and Fullscreen */}
              <div className="flex items-center space-x-2">
                {/* Volume */}
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                {/* Fullscreen */}
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Secondary Controls Row */}
            <div className="flex items-center justify-between">
              {/* Left side - Episode navigation */}
              <div className="flex items-center space-x-2">
                {onPrevious && (
                  <Button
                    onClick={onPrevious}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                )}
                {onNext && (
                  <Button
                    onClick={onNext}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-2"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Center - Time display */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Right side - Tools */}
              <div className="flex items-center space-x-1">
                {/* Playback speed */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 text-xs p-2"
                    >
                      {playbackSpeed}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {playbackSpeeds.map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed)}
                        className={`text-white hover:bg-white/20 ${speed === playbackSpeed ? 'bg-white/10' : ''}`}
                      >
                        {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Rotation */}
                <Button
                  onClick={rotateVideo}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-2"
                  title={`Rotate (${rotation}°)`}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Settings */}
                <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 p-2"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-white hover:bg-white/20">
                      Auto Play Next: {autoPlayNext ? 'On' : 'Off'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/20">
                      Loop: Off
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};