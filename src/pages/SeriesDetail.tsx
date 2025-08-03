import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Star, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Calendar,
  Users,
  Award,
  Globe,
  Film
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePaywall } from '@/hooks/usePaywall';
import { Paywall } from '@/components/Paywall';
import { getSeriesById, type SeriesDetail, Episode } from '@/services/seriesService';

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { showPaywall, paywallContext, closePaywall, requireSubscription } = usePaywall();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const seriesData = await getSeriesById(id);
        
        if (!seriesData) {
          setError('Series not found');
          return;
        }
        
        setSeries(seriesData);
        // Set first episode as selected by default
        if (seriesData.episodes.length > 0) {
          setSelectedEpisode(seriesData.episodes[0]);
        }
      } catch (err) {
        console.error('Error fetching series:', err);
        setError('Failed to load series details');
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [id]);

  const handlePlayEpisode = (episode: Episode) => {
    console.log('Playing episode:', episode);
    console.log('Episode video_url:', episode.video_url);
    console.log('Series ID:', id);
    console.log('Episode ID:', episode.id);
    
    // Validate episode data
    if (!episode.id) {
      console.error('Episode ID is missing');
      alert('Error: Episode ID is missing');
      return;
    }

    if (!id) {
      console.error('Series ID is missing');
      alert('Error: Series ID is missing');
      return;
    }
    
    // Check subscription before playing
    requireSubscription(() => {
      // Navigate to video player with episode data
      if (episode.video_url && episode.video_url.trim() !== '') {
        // If episode has a direct video URL, use it
        const videoUrl = episode.video_url.trim();
        const navigationUrl = `/player/${id}/${episode.id}?videoUrl=${encodeURIComponent(videoUrl)}`;
        console.log('Navigating to:', navigationUrl);
        navigate(navigationUrl);
      } else {
        // Fallback to Bunny Stream with episode number
        const navigationUrl = `/player/${id}/${episode.id}?episodeNumber=${episode.episode_number}`;
        console.log('Navigating to (fallback):', navigationUrl);
        navigate(navigationUrl);
      }
    }, series?.title);
  };

  const handleBackClick = () => {
    navigate('/series');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navigation isAuthenticated={!!user} />
        <MobileBottomNav isAuthenticated={!!user} />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navigation isAuthenticated={!!user} />
        <MobileBottomNav isAuthenticated={!!user} />
        <div className="container mx-auto px-4 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              {error || 'Series not found'}
            </h1>
            <Button onClick={handleBackClick} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Series
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16 md:pb-0">
      <Navigation isAuthenticated={!!user} />
      <MobileBottomNav isAuthenticated={!!user} />

      {/* Hero Section */}
      <div className="relative min-h-screen md:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${series.banner_url || series.poster_url})`,
            filter: 'blur(2px) brightness(0.3)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative h-full flex items-center md:items-end">
          <div className="container mx-auto px-4 lg:px-8 pt-20 md:pt-0 md:pb-8">
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex flex-col items-center text-center">
                {/* Large Poster for Mobile */}
                <div className="mb-8">
                  <img
                    src={series.poster_url}
                    alt={series.title}
                    className="w-56 h-80 object-cover rounded-lg shadow-2xl mx-auto"
                  />
                </div>
                
                {/* Badges */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {series.is_featured && (
                    <Badge variant="default" className="bg-primary-green">
                      FEATURED
                    </Badge>
                  )}
                  {series.status === 'coming_soon' && (
                    <Badge variant="secondary">
                      COMING SOON
                    </Badge>
                  )}
                  <Badge variant="outline">{series.maturity_rating || 'PG'}</Badge>
                </div>
                
                {/* Title */}
                <h1 className="text-2xl font-orbitron font-bold text-text-primary mb-4">
                  {series.title}
                </h1>
                
                {/* Description */}
                <p className="text-sm text-text-secondary mb-6 px-4 leading-relaxed">
                  {series.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-3 text-text-secondary mb-6 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-accent-glow fill-current" />
                    <span>{series.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{series.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{series.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{series.year}</span>
                  </div>
                </div>
                
                {/* Genres */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {series.genres.map((genre, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full max-w-sm mb-8">
                  {series.episodes.length > 0 && (
                    <Button 
                      size="lg" 
                      className="bg-primary-green hover:bg-primary-green/90 w-full"
                      onClick={() => handlePlayEpisode(series.episodes[0])}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Now
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="lg" className="flex-1">
                      <Heart className="h-5 w-5 mr-2" />
                      Add to List
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1">
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={series.poster_url}
                  alt={series.title}
                  className="w-64 h-96 object-cover rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-4">
                  {series.is_featured && (
                    <Badge variant="default" className="bg-primary-green">
                      FEATURED
                    </Badge>
                  )}
                  {series.status === 'coming_soon' && (
                    <Badge variant="secondary">
                      COMING SOON
                    </Badge>
                  )}
                  <Badge variant="outline">{series.maturity_rating || 'PG'}</Badge>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-text-primary mb-4">
                  {series.title}
                </h1>
                
                <p className="text-lg text-text-secondary mb-6 max-w-3xl">
                  {series.description}
                </p>
                
                <div className="flex items-center gap-6 text-text-secondary mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent-glow fill-current" />
                    <span>{series.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{series.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{series.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{series.year}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {series.genres.map((genre, index) => (
                    <Badge key={index} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  {series.episodes.length > 0 && (
                    <Button 
                      size="lg" 
                      className="bg-primary-green hover:bg-primary-green/90"
                      onClick={() => handlePlayEpisode(series.episodes[0])}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Now
                    </Button>
                  )}
                  <Button variant="outline" size="lg">
                    <Heart className="h-5 w-5 mr-2" />
                    Add to List
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="episodes">Episodes ({series.episodes.length})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="mt-6">
            {series.episodes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary text-lg">No episodes available yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {series.episodes.map((episode) => (
                  <Card 
                    key={episode.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedEpisode?.id === episode.id ? 'ring-2 ring-primary-green' : ''
                    }`}
                    onClick={() => setSelectedEpisode(episode)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-20 flex-shrink-0">
                          <img
                            src={episode.thumbnail_url || series.poster_url}
                            alt={episode.title}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              S{episode.season_number} E{episode.episode_number}
                            </Badge>
                            <span className="text-text-secondary text-sm">
                              {episode.duration} min
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-text-primary mb-1">
                            {episode.title}
                          </h3>
                          
                          <p className="text-text-secondary text-sm line-clamp-2">
                            {episode.description}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2 text-text-secondary text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{episode.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-accent-glow fill-current" />
                              <span>{episode.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayEpisode(episode);
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Series Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-text-secondary" />
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary">Web Series</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-text-secondary" />
                    <span className="text-text-secondary">Language:</span>
                    <span className="text-text-primary">{series.language || 'English'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-text-secondary" />
                    <span className="text-text-secondary">Release Date:</span>
                    <span className="text-text-primary">{series.release_date || 'TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-text-secondary" />
                    <span className="text-text-secondary">Total Episodes:</span>
                    <span className="text-text-primary">{series.total_episodes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-text-secondary" />
                    <span className="text-text-secondary">Rating:</span>
                    <span className="text-text-primary">{series.rating.toFixed(1)}/5.0</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {series.director_name && (
                    <div>
                      <span className="text-text-secondary">Director:</span>
                      <p className="text-text-primary">{series.director_name}</p>
                    </div>
                  )}
                  {series.creator_name && (
                    <div>
                      <span className="text-text-secondary">Creator:</span>
                      <p className="text-text-primary">{series.creator_name}</p>
                    </div>
                  )}
                  {series.country && (
                    <div>
                      <span className="text-text-secondary">Country:</span>
                      <p className="text-text-primary">{series.country}</p>
                    </div>
                  )}
                  {series.long_description && (
                    <div>
                      <span className="text-text-secondary">Synopsis:</span>
                      <p className="text-text-primary mt-2">{series.long_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="cast" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cast & Crew</CardTitle>
              </CardHeader>
              <CardContent>
                {series.cast_members && series.cast_members.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {series.cast_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border-standard">
                        <div className="w-12 h-12 bg-primary-green/20 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary-green" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{member}</p>
                          <p className="text-sm text-text-secondary">Actor</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">
                    Cast information not available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
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

export default SeriesDetail; 