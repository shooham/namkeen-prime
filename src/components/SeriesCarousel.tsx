import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WebSeriesCard from './WebSeriesCard';

interface SeriesCarouselProps {
  title: string;
  series: Array<{
    id: string;
    title: string;
    posterUrl: string;
    rating?: number;
    duration?: string;
    year?: number;
    genres?: string[];
    isComingSoon?: boolean;
  }>;
}

const SeriesCarousel: React.FC<SeriesCarouselProps> = ({ title, series }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of a card plus gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-text-primary mb-2">
              {title}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-primary-green to-accent-glow rounded-full" />
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              className="holo-glow"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              className="holo-glow"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {series.map((item) => (
              <div key={item.id} className="flex-none w-72">
                <WebSeriesCard
                  series={{
                    id: item.id,
                    title: item.title,
                    poster_url: item.posterUrl,
                    rating: item.rating || 0,
                    duration: item.duration || 'Unknown',
                    year: item.year || new Date().getFullYear(),
                    genres: item.genres || [],
                    status: item.isComingSoon ? 'coming_soon' : 'active',
                    is_featured: false,
                    is_trending: false,
                    view_count: 0,
                    like_count: 0,
                    bookmark_count: 0,
                    total_episodes: 0,
                    total_seasons: 1,
                    description: '',
                    episodes: []
                  }}
                />
              </div>
            ))}
          </div>

          {/* Gradient Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-bg-primary to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

export default SeriesCarousel;