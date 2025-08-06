'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const GradientBackground = dynamic(() => import('./GradientBackground'), { ssr: false });

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollProgress = Math.min(scrollY / 100, 1);
  const scale = 1 - scrollProgress * 0.1;
  const borderRadius = scrollProgress * 28;
  const marginTop = scrollProgress * 32;
  const marginHorizontal = scrollProgress * 32;

  return (
    <section className="relative min-h-screen">
      {/* Hero Container */}
      <div 
        className="
          overflow-hidden bg-black
          transition-all duration-700 ease-out
          sticky top-8 md:top-36
        "
        style={{
          transform: `scale(${scale})`,
          borderRadius: `${borderRadius}px`,
          marginTop: `${marginTop}px`,
          marginLeft: `${marginHorizontal}px`,
          marginRight: `${marginHorizontal}px`,
          height: `${76 - scrollProgress * 20}vh`,
          minHeight: '76vh'
        }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <GradientBackground />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center cursor-default">
          <div className="text-center">
            <h1 
              className="
                font-satoshi font-bold text-white
                animate-in zoom-in-75 slide-in-from-top-14
                text-8xl md:text-9xl hover:scale-105
                transition-all duration-1000 ease-out
              "
            >
              {"हित"}
            </h1>

            {/* Subtitle */}
            <p 
              className="
                mt-6 text-xl md:text-2xl text-white/80 font-light
                animate-in zoom-in-90 slide-in-from-top-8
                opacity-100 translate-y-0 transition-all duration-700
              "
            >
              Where wellness meets wisdom
            </p>

            {/* CTA Button */}
            <div 
              className="
                mt-12 opacity-100 translate-y-0 transition-all duration-700
              "
            >
              <button 
                onClick={() => router.push('/products')} 
                className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-1000 hover:scale-105 animate-in zoom-in-75"
              >
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="
            absolute bottom-8 left-1/2 transform -translate-x-1/2

            opacity-100 translate-y-0 transition-all duration-1000
          "
        >
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm mb-2">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-3/4" />
    </section>
  );
}
