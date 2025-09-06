// import { ApodDisplay } from '@/components/ApodDisplay';
import HeroSection from '@/components/HeroSection';
import FAQSection from '@/components/FAQSection';
import CallToAction from '@/components/CallToAction';
import HitaDesc from '@/components/HitaDesc';
import MainPaths from '@/components/MainPaths';
import WhyHita from '@/components/WhyHita';
import HitaMeaning from '@/components/HitaMeaning';

export default function Home() {
  return (
    <>
      <HeroSection/>
      
      {/* Main Content */}
      <main className="min-h-screen w-[99vw] flex flex-col items-center">

        <HitaDesc/>
    
        <MainPaths/>

        <WhyHita/>

        <FAQSection/>

        <HitaMeaning/>

        <CallToAction/>
        
      </main>
      
        {/* <ApodDisplay/> */}
    </>
  );
}