'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const GradientBackground = dynamic(() => import('./GradientBackground'), { ssr: false });

interface LoadingScreenProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
  minLoadingTime?: number; // minimum time to show loading screen
  text?: string; // customizable text
}

export default function LoadingScreen({
  isLoading,
  onLoadingComplete,
  minLoadingTime = 2000,
  text = "हित"
}: LoadingScreenProps) {
  const [shouldShow, setShouldShow] = useState<boolean>(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Add a minimum display time before hiding
      const timer = setTimeout(() => {
        setShouldShow(false);
        onLoadingComplete?.();
      }, minLoadingTime);

      return () => clearTimeout(timer);
    } else {
      setShouldShow(true);
    }
  }, [isLoading, minLoadingTime, onLoadingComplete]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-out fade-out duration-600">
      <div className="relative w-full h-full flex items-center justify-center">
        <GradientBackground />
        
        <div className="z-10 relative text-center">
          <p className="text-7xl font-satoshi font-bold text-white animate-pulse">
            {text}
          </p>
          
          {/* Optional loading indicator */}
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}