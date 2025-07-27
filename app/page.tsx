'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
// import GradientBackground from '@/components/GradientBackground';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); 

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
        <section className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-xl">
          <h1 className='text-6xl font-satoshi'>Hita</h1>
        </section>
      </main>
    </>
  );
}