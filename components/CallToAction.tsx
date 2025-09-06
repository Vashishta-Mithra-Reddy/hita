"use client";

import { motion } from "framer-motion";
import Modal from "./modal"

export default function CallToAction(){
    return(
        <section className="max-w-7xl relative py-40 md:pt-32 md:pb-24 flex items-center justify-center p-8 w-full rounded-xl">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} viewport={{once:true,amount:0.5}} className="text-4xl md:text-6xl text-foreground/80 font-satoshi font-black mb-4">
              Start Your Journey
            </motion.h2>
            <motion.p initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay: 0.2}} viewport={{once:true,amount:0.5}} className="text-xl text-foreground/60 mb-6">
              Ready to transform your well-being? 
            </motion.p>
            <motion.div initial={{opacity:0,y:50,scale:0.7}} whileInView={{opacity:1,y:0,scale:1}} transition={{duration:0.7, delay: 0.4}} viewport={{once:true,amount:0.5}} className="flex flex-col md:flex-row gap-4 justify-center">
              {/* <Link href="/products" className="px-12 py-4 bg-radial dark:from-blue-300/80 from-blue-300 dark:via-blue-300/80 via-blue-300 dark:to-blue-400/80 to-blue-400/80 text-white rounded-full font-semibold font-satoshi tracking-wide hover:shadow-xl transition-all duration-300 hover:scale-105">
                Browse Through Products
              </Link>
              <Link href="/foods" className="px-12 py-4 bg-radial dark:from-green-300/80 from-green-300 dark:via-green-300/80 via-green-300 dark:to-green-400/80 to-green-400/80 text-white rounded-full font-semibold font-satoshi tracking-wide hover:shadow-xl transition-all duration-300 hover:scale-105">
                Explore Foods
              </Link> */}
              <Modal/>
            </motion.div>
          </div>
        </section>
    );
}