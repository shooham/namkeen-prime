import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Info, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-bg.jpg';
import { getAllSeries } from '@/services/seriesService';

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated = false }) => {
  const [seriesCount, setSeriesCount] = useState(0);

  useEffect(() => {
    const fetchSeriesCount = async () => {
      try {
        const series = await getAllSeries();
        setSeriesCount(series.length);
      } catch (error) {
        console.error('Error fetching series count:', error);
      }
    };

    fetchSeriesCount();
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Namkeen Prime streaming platform hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/50" />
      </div>

      {/* Animated Data Grid Background */}
      <div className="absolute inset-0 data-grid opacity-30" />

      {/* Holographic Targeting Reticles */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 border border-primary-green/50 rounded-full animate-pulse">
        <div className="absolute inset-2 border border-accent-glow/70 rounded-full" />
      </div>
      <div className="absolute bottom-1/3 right-1/4 w-12 h-12 border border-accent-glow/40 rounded-full animate-pulse delay-1000">
        <div className="absolute inset-1 border border-primary-green/60 rounded-full" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl">
          {/* Glitch Effect Title */}
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-orbitron font-black text-text-primary mb-4 leading-tight">
              Welcome to the
              <br />
              <span className="holo-gradient bg-clip-text text-transparent animate-pulse">
                Future
              </span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-primary-green to-accent-glow rounded-full mb-6" />
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-2xl leading-relaxed">
            Experience premium web series like never before with Namkeen Prime. Immerse yourself in 
            <span className="text-primary-green font-semibold"> cutting-edge storytelling</span> with 
            high-quality streaming.
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { icon: Zap, text: "4K Ultra HD" },
              { icon: Play, text: "Instant Streaming" },
              { icon: Info, text: "Exclusive Content" }
            ].map(({ icon: Icon, text }, index) => (
              <div key={index} className="flex items-center space-x-2 text-text-secondary">
                <Icon className="h-5 w-5 text-accent-glow" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isAuthenticated ? (
              <>
                <Button variant="hero" size="xl" className="group">
                  <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  Start Your Journey
                </Button>
                <Button variant="outline" size="xl">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Trailer
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="xl" className="group">
                  <Info className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  Explore New Series
                </Button>
                <Button variant="outline" size="xl">
                  <Play className="h-5 w-5 mr-2" />
                  Browse Library
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md">
            {[
              { number: seriesCount > 0 ? `${seriesCount}` : "0", label: "Original Series" },
              { number: "New", label: "Platform" },
              { number: "HD", label: "Quality" }
            ].map(({ number, label }, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-orbitron font-bold text-primary-green mb-1">
                  {number}
                </div>
                <div className="text-text-secondary text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent-glow/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;