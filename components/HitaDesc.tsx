"use client";

import { motion } from "framer-motion";

export default function HitaDesc() {
    return(
        <section className="relative py-40 md:py-44 flex items-center justify-center px-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 initial={{opacity:0,y:50,filter:"blur(5px)"}} whileInView={{opacity:1,y:0,filter:"blur(0px)"}} transition={{ease:"easeIn",duration:0.5}} viewport={{once:true,amount:0.5}} className="text-4xl md:text-6xl font-satoshi font-black text-foreground mb-6 text-balance">
              Welcome to<br />
              <motion.span initial={{opacity:0,y:50,filter:"blur(5px)"}} whileInView={{opacity:1,y:0,filter:"blur(0px)"}} transition={{ease:"easeIn",duration:0.5, delay: 0.2}} viewport={{once:true,amount:0.5}} className="inline-block pt-3">
                हित <span className="text-foreground/40 font-sans animate-fourth font-bold">| Hita</span>
              </motion.span>
            </motion.h2>

            <motion.p initial={{opacity:0,y:50,filter:"blur(5px)"}} whileInView={{opacity:1,y:0,filter:"blur(0px)"}} transition={{ease:"easeIn",duration:0.5, delay: 0.4}} viewport={{once:true,amount:0.5}} className="text-xl text-foreground/80 leading-relaxed text-balance max-w-xl">
              Here you can find healthy and verified products, trusted brands, remedies that actually work, wellness tips to make your life better and fooood data.
            </motion.p>
            {/* <p className="text-xl text-foreground/80 leading-relaxed text-balance">
              Think of hita as you well wisher we only show what&apos;s good for your health.
            </p> */}
          </div>
        </section>
    );
}