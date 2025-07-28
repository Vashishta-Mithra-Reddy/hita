'use client';

import HeroSection from '@/components/HeroSection';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Hero Section with Animation */}
      <HeroSection 
        text="हित"
        animationDuration={2000}
      />
      
      {/* Main Content */}
      <main className="min-h-screen w-[99vw] flex flex-col items-center">
        {/* Content Section 1 */}
        <section className="relative min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-satoshi font-bold text-foreground mb-6">
              Welcome to Hita
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Here you can find healthier alternatives to your daily goods or such and also you&apos;ll find remedies, wellness tips and so much more.
            </p>
          </div>
        </section>

        {/* Content Section 2 */}
        <section className="max-w-7xl relative rounded-xl flex items-center justify-center p-8 bg-foreground/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Products</h3>
                <p className="text-foreground/80">
                  You will find better and healthier and trusted products.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Remedies</h3>
                <p className="text-foreground/80">
                  Holistic approaches to physical health and emotional well-being.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Wellness Tips</h3>
                <p className="text-foreground/80">
                  Tips to change your life for the better.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section 3 */}
        <section className=" max-w-7xl relative min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-satoshi font-bold mb-4">
              Start Your Journey
            </h2>
            <p className="text-xl text-foreground/80 mb-10">
              Ready to transform your well-being? 
            </p>
            <Link href="/products" className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
              Browse Through Products
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}