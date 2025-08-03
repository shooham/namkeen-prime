import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import WebSeriesCard from '@/components/WebSeriesCard';
import { Button } from '@/components/ui/button';
import { Filter, Grid, List, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAllSeries, getSeriesByGenre, SeriesDetail } from '@/services/seriesService';
import seriesHero from '@/assets/series-hero.jpg';

const Series = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [series, setSeries] = useState<SeriesDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Crime', 'Horror', 'Sci-Fi', 'Fantasy', 'Family', 'Mystery', 'Biography', 'Documentary', 'Historical', 'Musical', 'Adventure', 'Psychological', 'Supernatural', 'Political', 'Sports'];

  // Fetch series data
  const fetchSeries = async (genre?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let seriesData: SeriesDetail[];
      if (genre && genre !== 'All') {
        seriesData = await getSeriesByGenre(genre);
      } else {
        seriesData = await getAllSeries();
      }
      
      setSeries(seriesData);
    } catch (err) {
      console.error('Error fetching series:', err);
      setError('Failed to load series. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSeries();
  }, []);

  // Handle genre change
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    fetchSeries(genre);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16 md:pb-0">
      <Navigation isAuthenticated={!!user} />
      <MobileBottomNav isAuthenticated={!!user} />

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${seriesHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-text-primary mb-4">
                Explore <span className="holo-gradient bg-clip-text text-transparent">Series</span>
              </h1>
              <p className="text-lg text-text-secondary mb-6">
                Discover cutting-edge web series from the future of entertainment
              </p>
              <div className="flex items-center space-x-4">
                <Button variant="hero" size="lg">
                  Start Watching
                </Button>
                <div className="text-text-secondary text-sm">
                  {loading ? 'Loading...' : `${series.length} Series Available`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* Genre Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-text-secondary" />
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenreChange(genre)}
                  className="text-xs"
                  disabled={loading}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode('grid')}
              disabled={loading}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode('list')}
              disabled={loading}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary-green" />
              <span className="text-text-secondary">Loading series...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchSeries()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Series Grid/List */}
        {!loading && !error && (
          <>
            {series.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary text-lg mb-4">
                  {selectedGenre === 'All' 
                    ? 'No series available at the moment.' 
                    : `No series found in ${selectedGenre} genre.`
                  }
                </p>
                {selectedGenre !== 'All' && (
                  <Button onClick={() => handleGenreChange('All')} variant="outline">
                    View All Series
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                : "space-y-4"
              }>
                {series.map((seriesItem) => (
                  <WebSeriesCard
                    key={seriesItem.id}
                    series={seriesItem}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Series;