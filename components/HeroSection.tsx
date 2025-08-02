'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const GradientBackground = dynamic(() => import('./GradientBackground'), { ssr: false });

interface HeroSectionProps {
  text?: string;
  animationDuration?: number;
}

export default function HeroSection({ 
  text = "हित",
  animationDuration = 2000 
}: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Initial animation timer
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);

    // Scroll handler
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(animationTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [animationDuration]);

  // Calculate scroll-based transformations
  const scrollProgress = Math.min(scrollY / 400, 1); // Normalize scroll to 0-1
  const scale = 1 - scrollProgress * 0.05; // Slight scale down
  const borderRadius = scrollProgress * 24; // Increase border radius
  const marginTop = scrollProgress * 32; // Add top margin
  const marginHorizontal = scrollProgress * 32; // Add horizontal margins
  const router = useRouter();

  return (
    <section className="relative min-h-screen w-full">
      {/* Hero Container */}
      <div 
        className={`
            relative overflow-hidden bg-black
          transition-all duration-700 ease-out
          ${isAnimating ? 'fixed inset-0' : 'sticky top-8 md:top-36'}
        `}
        style={{
          transform: `scale(${scale})`,
          borderRadius: `${borderRadius}px`,
          marginTop: `${marginTop}px`,
          marginLeft: `${marginHorizontal}px`,
          marginRight: `${marginHorizontal}px`,
          height: isAnimating ? '100vh' : `${80 - scrollProgress * 20}vh`,
          minHeight: '80vh'
        }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <GradientBackground />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 
              className={`
                font-satoshi font-bold text-white
                transition-all duration-1000 ease-out
                ${isAnimating 
                  ? 'text-7xl animate-pulse' 
                  : 'text-8xl md:text-9xl hover:scale-105'
                }
              `}
            >
              {text}
            </h1>
            
            {/* Subtitle that appears after animation */}
            <p 
              className={`
                mt-6 text-xl md:text-2xl text-white/80 font-light
                transition-all duration-1000 delay-500
                ${isAnimating 
                  ? 'opacity-0 translate-y-4' 
                  : 'opacity-100 translate-y-0'
                }
              `}
            >
              Where wellness meets wisdom
            </p>

            {/* Loading indicator that fades out */}
            {isAnimating && (
              <div className="mt-8 flex justify-center animate-fadeOut">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* CTA that appears after animation */}
            <div 
              className={`
                mt-12 transition-all duration-1000 delay-1000
                ${isAnimating 
                  ? 'opacity-0 translate-y-8' 
                  : 'opacity-100 translate-y-0'
                }
              `}
            >
              <button onClick={() => router.push('/products')} className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className={`
            absolute bottom-8 left-1/2 transform -translate-x-1/2
            transition-all duration-1000 delay-1500
            ${isAnimating 
              ? 'opacity-0 translate-y-4' 
              : 'opacity-100 translate-y-0'
            }
          `}
        >
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm mb-2">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Spacer to push content down */}
      <div className="h-screen" />
    </section>
  );
}