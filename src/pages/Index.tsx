import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import HeroSection from '@/components/HeroSection';
import { useAuth } from '@/hooks/useAuth';
import SeriesCarousel from '@/components/SeriesCarousel';
import { getNewReleases, SeriesDetail } from '@/services/seriesService';

const Index = () => {
  const { user, loading } = useAuth();
  const [newReleases, setNewReleases] = useState<SeriesDetail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch new releases only
        const releases = await getNewReleases();
        setNewReleases(releases);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading || dataLoading) {
        console.log('⏰ Index page loading timeout, forcing render');
        setDataLoading(false);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, [loading, dataLoading]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading Namkeen Prime...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-16 md:pb-0">
      {/* Navigation */}
      <Navigation isAuthenticated={!!user} />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav isAuthenticated={!!user} />
      
      {/* Hero Section */}
      <HeroSection isAuthenticated={!!user} />
      
      {/* Content Section - New Releases Only */}
      <div className="space-y-8">
        {/* Show new releases if available */}
        {newReleases.length > 0 && (
          <SeriesCarousel 
            title="New Releases" 
            series={newReleases.map(series => ({
              id: series.id,
              title: series.title,
              posterUrl: series.poster_url,
              rating: series.rating,
              duration: series.duration,
              year: series.year,
              genres: series.genres
            }))} 
          />
        )}
        
        {/* Show message if no new releases available */}
        {newReleases.length === 0 && (
          <div className="container mx-auto px-4 lg:px-8 py-16 text-center">
            <h2 className="text-2xl font-orbitron font-bold text-text-primary mb-4">
              No New Releases Yet
            </h2>
            <p className="text-text-secondary">
              New releases will appear here once they are uploaded and published.
            </p>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="mt-24 py-16 border-t border-border-standard">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-orbitron font-bold text-text-primary mb-4">
              Ready to Enter the Future?
            </h3>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Join millions of users experiencing premium entertainment with Namkeen Prime.
            </p>
            <div className="flex justify-center space-x-8 text-text-secondary text-sm">
              <a href="#" className="hover:text-primary-green transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-green transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary-green transition-colors">Contact Us</a>
            </div>
            <div className="mt-8 text-text-secondary text-sm">
              © 2024 Namkeen Prime. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
