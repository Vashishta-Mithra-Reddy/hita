'use client';

// import { ApodDisplay } from '@/components/ApodDisplay';
import HeroSection from '@/components/HeroSection';
import FadeInWhenVisible from '@/components/animations/FadeInWhenVisible';
import InViewWrapper from '@/components/animations/InViewWrapper';
import Modal from '@/components/modal';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <HeroSection/>
      
      {/* Main Content */}
      <main className="min-h-screen w-[99vw] flex flex-col items-center">
        {/* Content Section 1 */}
        <InViewWrapper animationClass='animate-in fade-in slide-in-from-bottom-12'>
        <section className="relative py-40 md:py-60 flex items-center justify-center px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-satoshi font-bold text-foreground mb-6 text-balance animate-in slide-in-from-bottom-28 duration-1000">
              Welcome to<br />
              <span className="inline-block pt-3 animate-in slide-in-from-bottom-32 duration-1000">
                हित <span className="text-foreground/40 font-sans">| Hita</span>
              </span>
            </h2>

            <p className="text-xl text-foreground/80 leading-relaxed text-balance max-w-xl animate-in slide-in-from-bottom-40 duration-1000 delay-200">
              Here you can find healthy and verified products, trusted brands, remedies that actually work, wellness tips to make your life better and fooood data.
            </p>
            {/* <p className="text-xl text-foreground/80 leading-relaxed text-balance">
              Think of hita as you well wisher we only show what&apos;s good for your health.
            </p> */}
          </div>
        </section>
        </InViewWrapper>

        {/* Content Section 2 */}
        <section className="max-w-7xl relative rounded-xl flex items-center justify-center p-8 bg-foreground/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/products" className='hover:bg-blue-500/10 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-700 animate-in slide-in-from-top-4'>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-blue-500 to-cyan-400 rounded-full mx-auto mb-4 animate-fifth"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Products</h3>
                <p className="text-foreground/80">
                  Better, healthier and trusted products.
                </p>
              </div>
              </Link>
              
              <Link href="/foods" className='hover:bg-green-500/10 dark:hover:bg-green-500/10 rounded-xl transition-all duration-700 animate-in slide-in-from-top-4 delay-100'>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-green-500 to-emerald-200 rounded-full mx-auto mb-4 animate-fifth"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Foods</h3>
                <p className="text-foreground/80">
                  Nutritious foods to boost your health and well-being.
                </p>
              </div>
              </Link>
              
              <Link href="/remedies" className='hover:bg-purple-500/10 dark:hover:bg-purple-500/10 rounded-xl transition-all duration-700 animate-in slide-in-from-top-4 delay-150'>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-purple-500 to-pink-500 rounded-full mx-auto mb-4 animate-fifth"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Remedies</h3>
                <p className="text-foreground/80">
                  Holistic approaches to physical health and emotional well-being.
                </p>
              </div>
              </Link>
              
              {/* <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-green-500 to-emerald-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-2xl font-satoshi font-semibold mb-3">Wellness Tips</h3>
                <p className="text-foreground/80">
                  Tips to change your life for the better.
                </p>
              </div> */}
            </div>
          </div>
        </section>

        {/* Content Section 3 */}
        <FadeInWhenVisible>
        <section className="max-w-7xl relative py-40 md:py-60 flex items-center justify-center p-8 w-full rounded-xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-satoshi font-bold mb-4">
              Start Your Journey
            </h2>
            <p className="text-xl text-foreground/80 mb-6">
              Ready to transform your well-being? 
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              {/* <Link href="/products" className="px-12 py-4 bg-radial dark:from-blue-300/80 from-blue-300 dark:via-blue-300/80 via-blue-300 dark:to-blue-400/80 to-blue-400/80 text-white rounded-full font-semibold font-satoshi tracking-wide hover:shadow-xl transition-all duration-300 hover:scale-105">
                Browse Through Products
              </Link>
              <Link href="/foods" className="px-12 py-4 bg-radial dark:from-green-300/80 from-green-300 dark:via-green-300/80 via-green-300 dark:to-green-400/80 to-green-400/80 text-white rounded-full font-semibold font-satoshi tracking-wide hover:shadow-xl transition-all duration-300 hover:scale-105">
                Explore Foods
              </Link> */}
              <Modal/>
            </div>
          </div>
        </section>
        </FadeInWhenVisible>
        
      </main>
      
        {/* <ApodDisplay/> */}
    </>
  );
}