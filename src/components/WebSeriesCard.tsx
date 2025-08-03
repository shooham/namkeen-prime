import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Clock, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SeriesDetail } from '@/services/seriesService';

interface WebSeriesCardProps {
  series: SeriesDetail;
  viewMode?: 'grid' | 'list';
}

const WebSeriesCard: React.FC<WebSeriesCardProps> = ({
  series,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();

  // Add null checks and default values
  if (!series) {
    return null;
  }

  const handleCardClick = () => {
    navigate(`/series/${series.id}`);
  };

  // Grid view (default)
  if (viewMode === 'grid') {
    return (
      <div 
        className="group relative holo-card overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_hsl(var(--primary-green)/0.3)] cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Poster Image */}
        <div className="relative overflow-hidden">
          <img
            src={series.poster_url || '/placeholder-series.svg'}
            alt={series.title || 'Series'}
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-series.svg';
            }}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-80" />
          
          {/* Status Badge */}
          {series.status === 'coming_soon' && (
            <div className="absolute top-4 left-4 bg-accent-glow text-bg-primary px-3 py-1 rounded-md text-xs font-bold">
              COMING SOON
            </div>
          )}
          
          {series.is_featured && (
            <div className="absolute top-4 left-4 bg-primary-green text-bg-primary px-3 py-1 rounded-md text-xs font-bold">
              FEATURED
            </div>
          )}
          
          {/* Rating Badge */}
          <div className="absolute top-4 right-4 flex items-center space-x-1 bg-bg-primary/80 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star className="h-3 w-3 text-accent-glow fill-current" />
            <span className="text-text-primary text-xs font-medium">{(series.rating || 0).toFixed(1)}</span>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              variant="glow" 
              size="icon" 
              className="h-16 w-16 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <Play className="h-8 w-8 ml-1" fill="currentColor" />
            </Button>
          </div>

          {/* Hover Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-bg-secondary/95 backdrop-blur-sm rounded-lg p-4 border border-border-standard">
              <h3 className="font-orbitron font-bold text-text-primary text-lg mb-2">{series.title || 'Untitled'}</h3>
              
              <div className="flex items-center space-x-4 text-text-secondary text-sm mb-3">
                <span>{series.year || new Date().getFullYear()}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{series.duration || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{series.view_count || 0}</span>
                </div>
              </div>

              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {series.genres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="bg-primary-green/20 text-primary-green px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Watch Now
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div 
      className="group relative holo-card overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary-green)/0.2)] cursor-pointer border border-border-standard rounded-lg"
      onClick={handleCardClick}
    >
      <div className="flex">
        {/* Poster Image */}
        <div className="relative w-48 h-32 flex-shrink-0">
          <img
            src={series.poster_url || '/placeholder-series.svg'}
            alt={series.title || 'Series'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-series.svg';
            }}
          />
          
          {/* Status Badge */}
          {series.status === 'coming_soon' && (
            <div className="absolute top-2 left-2 bg-accent-glow text-bg-primary px-2 py-1 rounded text-xs font-bold">
              COMING SOON
            </div>
          )}
          
          {series.is_featured && (
            <div className="absolute top-2 left-2 bg-primary-green text-bg-primary px-2 py-1 rounded text-xs font-bold">
              FEATURED
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-text-primary text-lg mb-2">{series.title || 'Untitled'}</h3>
              
              <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                {series.description || 'No description available'}
              </p>
              
              <div className="flex items-center space-x-4 text-text-secondary text-sm mb-3">
                <span>{series.year || new Date().getFullYear()}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{series.duration || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{series.view_count || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-accent-glow fill-current" />
                  <span>{(series.rating || 0).toFixed(1)}</span>
                </div>
              </div>

              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {series.genres.slice(0, 4).map((genre, index) => (
                    <span
                      key={index}
                      className="bg-primary-green/20 text-primary-green px-2 py-1 rounded text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 ml-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Watch
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Add to favorites
                }}
              >
                <Heart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSeriesCard;