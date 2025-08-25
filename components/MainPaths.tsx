"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MainPaths(){
    return (
        <section className="max-w-7xl relative rounded-xl flex items-center justify-center p-8 bg-foreground/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/products" className='hover:bg-blue-500/10 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-700'>
              <motion.div initial={{opacity:0,y:50, scale:0.9}} whileInView={{opacity:1,y:0, scale:1}} transition={{duration:0.7}} viewport={{once:true,amount:0.5}} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-blue-500 to-cyan-400 rounded-full mx-auto mb-4 animate-second"></div>
                <motion.h3 initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay:0.1}} viewport={{once:true,amount:0.5}} className="text-2xl font-satoshi font-extrabold mb-2">Products</motion.h3>
                <motion.p initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay:0.2}} viewport={{once:true,amount:0.5}} className="text-foreground/80">
                  Better, healthier and trusted products.
                </motion.p>
              </motion.div>
              </Link>
              
              <Link href="/foods" className='hover:bg-green-500/10 dark:hover:bg-green-500/10 rounded-xl transition-all duration-700'>
              <motion.div initial={{opacity:0,y:50, scale:0.9}} whileInView={{opacity:1,y:0,scale:1}} transition={{duration:0.7, delay: 0.2}} viewport={{once:true,amount:0.5}} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-green-500 to-emerald-200 rounded-full mx-auto mb-4 animate-fifth"></div>
                <motion.h3 initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay:0.4}} viewport={{once:true,amount:0.5}} className="text-2xl font-satoshi font-extrabold mb-2">Foods</motion.h3>
                <motion.p initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay:0.5}} viewport={{once:true,amount:0.5}} className="text-foreground/80">
                  Nutritious foods to boost your health and well-being.
                </motion.p>
              </motion.div>
              </Link>
              
              <Link href="/remedies" className='hover:bg-purple-500/10 dark:hover:bg-purple-500/10 rounded-xl transition-all duration-700'>
              <motion.div initial={{opacity:0,y:50,scale:0.9}} whileInView={{opacity:1,y:0,scale:1}} transition={{duration:0.7, delay: 0.4}} viewport={{once:true,amount:0.5}} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-bl from-purple-500 to-pink-500 rounded-full mx-auto mb-4 animate-fifth"></div>
                <motion.h3 initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay:0.6}} viewport={{once:true,amount:0.5}} className="text-2xl font-satoshi font-extrabold mb-2">Remedies</motion.h3>
                <motion.p initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} transition={{duration:0.7, delay:0.7}} viewport={{once:true,amount:0.5}} className="text-foreground/80">
                  Holistic approaches to physical health and emotional well-being.
                </motion.p>
              </motion.div>
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
    );
}