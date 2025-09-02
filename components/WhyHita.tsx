"use client";

import InViewWrapper from '@/components/animations/InViewWrapper';
import Image from 'next/image';
import {motion} from "framer-motion";
import Lightt from '@/public/lightt.png';
import Hitax from '@/public/hita_logo.png';

export default function WhyHita(){
    const features = [
      "Carefully selected clean and reliable products",
      "Trusted remedies and practical wellness insights",
      "Full transparency with trustworthy brands"
    ];

    return(
        <section className='flex flex-col md:flex-row gap-20 justify-center items-center pb-40 md:mx-0 mx-4 max-w-6xl wrapperx'>
          
          <InViewWrapper animationClass='animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:slide-in-from-left-8 zoom-in-75 fade-in duration-1000'>
          <div className="relative group">
            <Image src={Lightt} alt="An image of a luminous object" className="max-w-screen md:max-w-md rounded-xl group-hover:brightness-200 transition-all duration-1000 group-hover:rotate-2 group-hover:scale-105" />
            <Image src={Hitax} width={80} height={80} alt="hita" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:scale-100 scale-75" />
          </div>
          </InViewWrapper>
          <InViewWrapper>
            <div>
            <h3 className='text-4xl md:text-5xl font-satoshi font-extrabold md:text-start text-center tracking-tight text-foreground/80'>
              What is Hita?
            </h3>
            <motion.p initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} viewport={{once:true,amount:0.5}} className='mt-6 text-base md:text-base md:text-start text-center text-balance md:text-pretty text-foreground/85'>
              Hita is a wellness platform designed to help you discover clean, reliable, and beneficial products with ease.  
              We simplify your search by bringing together trusted remedies, mindful choices, and transparent brands you can rely on. 
            </motion.p>
            <ul className='mt-4 md:mt-2 list-disc list-inside md:text-start text-center text-foreground/75 md:space-y-0 space-y-2'>
              {features.map((feature,index)=>(
                <motion.li key={feature} initial={{opacity:0,x:50}} whileInView={{opacity:1,x:0}} transition={{duration:0.5, delay: 0.2*index}} viewport={{once:true,amount:0.5}} className='text-balance'>
                    {feature}
                </motion.li>
              ))}
            </ul>
          </div>
          </InViewWrapper>
        </section>
    );
}