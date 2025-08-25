'use client';

// import { ApodDisplay } from '@/components/ApodDisplay';
import HeroSection from '@/components/HeroSection';
import InViewWrapper from '@/components/animations/InViewWrapper';
import Image from 'next/image';
import Lightt from '@/public/lightt.png';
import Hitax from '@/public/hita_logo.png';
import FAQSection from '@/components/FAQSection';
import CallToAction from '@/components/CallToAction';
import HitaDesc from '@/components/HitaDesc';
import MainPaths from '@/components/MainPaths';

export default function Home() {
  return (
    <>
      <HeroSection/>
      
      {/* Main Content */}
      <main className="min-h-screen w-[99vw] flex flex-col items-center">

        <HitaDesc/>

        <section className='flex flex-col md:flex-row gap-20 justify-center items-center pb-64 max-w-6xl wrapperx'>
          <InViewWrapper>
          <div>
            <h3 className='text-4xl md:text-5xl font-satoshi md:text-start text-center tracking-tight text-foreground/80'>Why Hita?</h3>
            <p className='mt-6 text-base md:text-base md:text-start text-center'>I have spent countless hours on researching the right product, that perfect remedy that could work, a clean brand that I could trust (You can think of it more like a directory of sorts for the products I trust.)</p>
          </div>
          </InViewWrapper>
          <InViewWrapper animationClass='animate-in slide-in-from-right-20 zoom-in-75 duration-1000'>
          <div className="relative group">
            <Image src={Lightt} alt="An image of a luminous object" className="max-w-screen md:max-w-xl rounded-xl group-hover:brightness-200 transition-all duration-1000" />
            <Image src={Hitax} width={100} height={100} alt="hita" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:scale-100 scale-75" />
          </div>
          </InViewWrapper>
        </section>

        <FAQSection/>

        <MainPaths/>

        <CallToAction/>
        
      </main>
      
        {/* <ApodDisplay/> */}
    </>
  );
}