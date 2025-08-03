import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import BunnyVideoPlayer from '@/components/BunnyVideoPlayer';
import { HLSVideoPlayer } from '@/components/HLSVideoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { getSeriesById, type SeriesDetail, Episode } from '@/services/seriesService';
import { BUNNY_CONFIG, getVideoIdForEpisode } from '@/config/bunnyConfig';
import { usePaywall } from '@/hooks/usePaywall';
import { Paywall } from '@/components/Paywall';

// Enhanced HLS Video Player Component with Bunny.net support
const DirectVideoPlayer: React.FC<{
  videoUrl: string;
  title?: string;
  onClose?: () => void;
  episode?: Episode;
  seriesData?: SeriesDetail;
  onNext?: () => void;
  onPrevious?: () => void;
}> = ({ videoUrl, title, onClose, episode, seriesData, onNext, onPrevious }) => {
  console.log('🎬 DirectVideoPlayer: Initializing with URL:', videoUrl);
  console.log('🎬 DirectVideoPlayer: Episode data:', episode);
  console.log('🎬 DirectVideoPlayer: Title:', title);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      {onClose && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/70 text-white hover:bg-black/90 backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Enhanced HLS Video Player */}
      <HLSVideoPlayer
        src={videoUrl}
        poster={episode?.thumbnail_url}
        className="w-full h-full"
        title={title}
        onNext={onNext}
        onPrevious={onPrevious}
        autoPlayNext={true}
      />
    </div>
  );
};

const VideoPlayer = () => {
  const { seriesId, episodeId } = useParams<{ seriesId: string; episodeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showPaywall, paywallContext, closePaywall, checkAccess } = usePaywall();

  const [seriesData, setSeriesData] = useState<SeriesDetail | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get video parameters from URL
  const videoLibraryId = searchParams.get('libraryId') || BUNNY_CONFIG.DEFAULT_LIBRARY_ID;
  const videoId = searchParams.get('videoId') || BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_1;
  const videoUrl = searchParams.get('videoUrl');
  const episodeNumber = searchParams.get('episodeNumber');

  console.log('VideoPlayer mounted with params:', {
    seriesId,
    episodeId,
    videoUrl,
    episodeNumber,
    videoLibraryId,
    videoId
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId) {
        setError('No series ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching series data for ID:', seriesId);
        const series = await getSeriesById(seriesId);

        if (!series) {
          setError('Series not found');
          setLoading(false);
          return;
        }

        console.log('Series data fetched:', series);
        setSeriesData(series);

        // Find the current episode
        if (episodeId && series.episodes) {
          const episode = series.episodes.find(ep => ep.id === episodeId);
          console.log('Found episode:', episode);
          setCurrentEpisode(episode || null);

          if (!episode) {
            setError('Episode not found');
          }
        }

        // Check subscription access
        const hasAccess = checkAccess(seriesId, episodeId, series.title);
        if (hasAccess === false) {
          // User doesn't have access, paywall will be shown
          return;
        }
      } catch (error) {
        console.error('Error fetching series data:', error);
        setError('Failed to load series data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId, episodeId, checkAccess]);

  // Get the actual video source for the current episode
  const getCurrentVideoSource = () => {
    console.log('Getting video source with:', {
      videoUrl,
      currentEpisode: currentEpisode?.video_url,
      episodeNumber,
      currentEpisodeNumber: currentEpisode?.episode_number
    });

    // Priority: 1. URL parameter video URL, 2. Episode video_url from database, 3. Bunny Stream ID
    if (videoUrl) {
      console.log('Using URL parameter video:', videoUrl);
      return { type: 'direct', url: decodeURIComponent(videoUrl) };
    }

    if (currentEpisode?.video_url) {
      console.log('Using episode video_url:', currentEpisode.video_url);
      return { type: 'direct', url: currentEpisode.video_url };
    }

    // Fallback to Bunny Stream
    const bunnyVideoId = episodeNumber
      ? getVideoIdForEpisode(parseInt(episodeNumber))
      : (currentEpisode ? getVideoIdForEpisode(currentEpisode.episode_number) : videoId);

    console.log('Using Bunny Stream fallback:', bunnyVideoId);
    return { type: 'bunny', videoId: bunnyVideoId, libraryId: videoLibraryId };
  };

  const handleClose = () => {
    if (seriesId) {
      navigate(`/series/${seriesId}`);
    } else {
      navigate('/series');
    }
  };

  const handleNextEpisode = () => {
    if (seriesData && currentEpisode) {
      const currentIndex = seriesData.episodes.findIndex(ep => ep.id === currentEpisode.id);
      const nextEpisode = seriesData.episodes[currentIndex + 1];

      if (nextEpisode) {
        if (nextEpisode.video_url) {
          navigate(`/player/${seriesId}/${nextEpisode.id}?videoUrl=${encodeURIComponent(nextEpisode.video_url)}`);
        } else {
          navigate(`/player/${seriesId}/${nextEpisode.id}?episodeNumber=${nextEpisode.episode_number}`);
        }
      }
    }
  };

  const handlePreviousEpisode = () => {
    if (seriesData && currentEpisode) {
      const currentIndex = seriesData.episodes.findIndex(ep => ep.id === currentEpisode.id);
      const prevEpisode = seriesData.episodes[currentIndex - 1];

      if (prevEpisode) {
        if (prevEpisode.video_url) {
          navigate(`/player/${seriesId}/${prevEpisode.id}?videoUrl=${encodeURIComponent(prevEpisode.video_url)}`);
        } else {
          navigate(`/player/${seriesId}/${prevEpisode.id}?episodeNumber=${prevEpisode.episode_number}`);
        }
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading video...</p>
          <p className="text-sm text-gray-400 mt-2">Series ID: {seriesId}</p>
          <p className="text-sm text-gray-400">Episode ID: {episodeId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Video</h2>
          <p className="text-lg mb-4">{error}</p>
          <div className="text-sm text-gray-400 mb-6">
            <p>Series ID: {seriesId}</p>
            <p>Episode ID: {episodeId}</p>
            <p>Video URL: {videoUrl || 'Not provided'}</p>
          </div>
          <Button onClick={handleClose} variant="outline" className="text-white border-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Series
          </Button>
        </div>
      </div>
    );
  }

  const videoSource = getCurrentVideoSource();
  console.log('Final video source:', videoSource);

  return (
    <div className="min-h-screen bg-black">
      {videoSource.type === 'direct' ? (
        <DirectVideoPlayer
          videoUrl={videoSource.url}
          title={currentEpisode?.title || seriesData?.title}
          episode={currentEpisode}
          seriesData={seriesData}
          onClose={handleClose}
          onNext={seriesData && currentEpisode && seriesData.episodes.indexOf(currentEpisode) < seriesData.episodes.length - 1 ? handleNextEpisode : undefined}
          onPrevious={seriesData && currentEpisode && seriesData.episodes.indexOf(currentEpisode) > 0 ? handlePreviousEpisode : undefined}
        />
      ) : (
        <BunnyVideoPlayer
          videoLibraryId={videoSource.libraryId}
          videoId={videoSource.videoId}
          title={currentEpisode?.title || seriesData?.title}
          onClose={handleClose}
          autoplay={true}
          muted={false}
          loop={false}
          showHeatmap={false}
          rememberPosition={true}
        />
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          seriesTitle={paywallContext.seriesTitle}
          onClose={closePaywall}
        />
      )}
    </div>
  );
};

export default VideoPlayer; 