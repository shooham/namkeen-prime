// Bunny.net Configuration
export const BUNNY_CONFIG = {
  // Default video library ID (you can change this to your actual library ID)
  DEFAULT_LIBRARY_ID: '759',
  
  // Demo video IDs for testing (replace with your actual video IDs)
  DEMO_VIDEOS: {
    // Sample video IDs - replace these with your actual Bunny Stream video IDs
    EPISODE_1: 'eb1c4f77-0cda-46be-b47d-1118ad7c2ffe',
    EPISODE_2: 'sample-video-id-2',
    EPISODE_3: 'sample-video-id-3',
    EPISODE_4: 'sample-video-id-4',
    EPISODE_5: 'sample-video-id-5',
  },
  
  // Player settings
  PLAYER_SETTINGS: {
    autoplay: true,
    muted: false,
    loop: false,
    showHeatmap: false,
    rememberPosition: true,
    preload: true,
    playsinline: true,
    showSpeed: true,
  },
  
  // Embed URL base
  EMBED_BASE_URL: 'https://iframe.mediadelivery.net/embed',
};

// Helper function to get video ID for episode
export const getVideoIdForEpisode = (episodeNumber: number): string => {
  const episodeMap: { [key: number]: string } = {
    1: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_1,
    2: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_2,
    3: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_3,
    4: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_4,
    5: BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_5,
  };
  
  return episodeMap[episodeNumber] || BUNNY_CONFIG.DEMO_VIDEOS.EPISODE_1;
};

// Helper function to build embed URL
export const buildEmbedUrl = (
  libraryId: string = BUNNY_CONFIG.DEFAULT_LIBRARY_ID,
  videoId: string,
  params: Record<string, string | boolean> = {}
): string => {
  const baseUrl = `${BUNNY_CONFIG.EMBED_BASE_URL}/${libraryId}/${videoId}`;
  const urlParams = new URLSearchParams();
  
  // Add default settings
  Object.entries(BUNNY_CONFIG.PLAYER_SETTINGS).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      urlParams.append(key, value.toString());
    }
  });
  
  // Add custom params
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      urlParams.append(key, value.toString());
    } else {
      urlParams.append(key, value);
    }
  });
  
  return `${baseUrl}?${urlParams.toString()}`;
}; 