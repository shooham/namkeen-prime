import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import WebSeriesCard from '@/components/WebSeriesCard';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, TrendingUp, Clock, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import searchHero from '@/assets/search-hero.jpg';
import series1 from '@/assets/series-1.jpg';
import series2 from '@/assets/series-2.jpg';
import series3 from '@/assets/series-3.jpg';

const Search = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const trendingSearches = [
    'Neural Networks', 'Cyberpunk', 'Space Opera', 'AI Thriller', 'Hologram'
  ];

  const recentSearches = [
    'Digital Awakening', 'Quantum Realm', 'Cyber Revolution'
  ];

  const popularSeries = [
    {
      id: '1',
      title: 'Neural Networks',
      posterUrl: series1,
      rating: 4.8,
      duration: '52 min',
      year: 2024,
      genres: ['Sci-Fi', 'Thriller', 'Drama'],
    },
    {
      id: '2',
      title: 'Cyber Revolution',
      posterUrl: series2,
      rating: 4.6,
      duration: '45 min',
      year: 2024,
      genres: ['Action', 'Cyberpunk', 'Adventure'],
    },
    {
      id: '3',
      title: 'Space Odyssey 2024',
      posterUrl: series3,
      rating: 4.9,
      duration: '58 min',
      year: 2024,
      genres: ['Space', 'Sci-Fi', 'Epic'],
    },
    {
      id: '4',
      title: 'Digital Awakening',
      posterUrl: series1,
      rating: 4.7,
      duration: '41 min',
      year: 2024,
      genres: ['AI', 'Mystery', 'Futuristic'],
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 1000);
  };

  const filteredResults = searchQuery 
    ? popularSeries.filter(series => 
        series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        series.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  if (loading) {
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
          style={{ backgroundImage: `url(${searchHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-text-primary mb-4">
                Find Your Next <span className="holo-gradient bg-clip-text text-transparent">Adventure</span>
              </h1>
              <p className="text-lg text-text-secondary mb-6">
                Search through our vast collection of futuristic entertainment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search for series, genres, or actors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-bg-secondary/50 border border-border-standard rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-primary-green border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-orbitron font-bold text-text-primary mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredResults.map((series) => (
                  <WebSeriesCard key={series.id} {...series} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SearchIcon className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No results found
                </h3>
                <p className="text-text-secondary">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        )}

        {/* Trending Searches */}
        {!searchQuery && (
          <>
            <div className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-6 w-6 text-primary-green" />
                <h2 className="text-2xl font-orbitron font-bold text-text-primary">
                  Trending Searches
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {trendingSearches.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    onClick={() => handleSearch(search)}
                    className="text-sm"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="mb-12">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-6 w-6 text-primary-green" />
                <h2 className="text-2xl font-orbitron font-bold text-text-primary">
                  Recent Searches
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((search) => (
                  <Button
                    key={search}
                    variant="ghost"
                    onClick={() => handleSearch(search)}
                    className="text-sm text-text-secondary"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Series */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Star className="h-6 w-6 text-primary-green" />
                <h2 className="text-2xl font-orbitron font-bold text-text-primary">
                  Popular Series
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {popularSeries.map((series) => (
                  <WebSeriesCard key={series.id} {...series} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;