'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading or actual loading logic
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // This would be your actual loading time

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    console.log('Loading complete!');
  };

  return (
    <>
      <LoadingScreen 
        isLoading={isLoading} 
        onLoadingComplete={handleLoadingComplete}
        minLoadingTime={1000}
        text="हित"
      />
      
      <main className="min-h-screen w-full flex flex-col p-4">
        {/* Your actual page content */}
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-xl">
          <h1 className='text-6xl font-satoshi'>Hita</h1>
        </section>
      </main>
    </>
  );
}