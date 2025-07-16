'use client';

import dynamic from 'next/dynamic';
const GradientBackground = dynamic(() => import('../components/GradientBackground'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col p-4">
      <section className="relative w-screen max-w-6xl h-[500px] flex items-center justify-center overflow-hidden rounded-xl">
        <GradientBackground />

        <div className="z-10 relative text-center">
          <p className="text-7xl font-satoshi font-bold text-white">हित</p>
        </div>
      </section>
    </main>
  );
}
