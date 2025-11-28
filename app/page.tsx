// import { ApodDisplay } from '@/components/ApodDisplay';
import HeroSection from '@/components/HeroSection';
import FAQSection from '@/components/FAQSection';
import CallToAction from '@/components/CallToAction';
import HitaDesc from '@/components/HitaDesc';
import MainPaths from '@/components/MainPaths';
import WhyHita from '@/components/WhyHita';
import HitaMeaning from '@/components/HitaMeaning';
import NavigationCard from '@/components/NavigationCard';

export default function Home() {
  return (
    <>
      <HeroSection/>
      
      {/* Main Content */}
      <main className="min-h-screen w-[99vw] flex flex-col items-center">

        <HitaDesc/>

        <div className='max-w-5xl max-w-screen mx-8 md:mx-0'>
        <NavigationCard
          title="Get context aware answers to your health queries."
          href="/agent"
          tag="Go to the Agent Page"
          delay={0.8}
          className='font-satoshi font-bold'
        />
        </div>
    
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