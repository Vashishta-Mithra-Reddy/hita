"use client";

import Link from "next/link";
import { motion } from "framer-motion";
// import Hita from "@/components/icons/hita.svg";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center  text-gray-800 px-6 text-center">
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0, filter:"blur(10px)" }}
        animate={{ scale: 1, opacity: 1 , filter:"blur(0px)"}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        // whileHover={{scale:1.1}}
        className="mb-0"
      >
        {/* <Compass className="h-20 w-20 text-blue-500 animate-fifth" /> */}
        <Link href={"/"}>
        <img src="/hita.svg" alt="Hita" className="h-40 w-40" />
        <img src="/hita.svg" alt="Hita" className="absolute top-0 right-0 scale-150 blur-3xl opacity-90 dark:opacity-80 h-40 w-40" />
        </Link>
        {/* <Hita/> */}
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl font-bold text-foreground/80 mb-3"
      >
        404
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg text-foreground/90 mb-6 max-w-sm "
      >
        Lost your way?<br></br> We got you covered
        {/* ,<br></br> Check out the button with arrows */}
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Link
          href="/"
          className="inline-block rounded-xl bg-[#30b0f8] px-6 py-3 text-white font-medium shadow-md hover:bg-[#46a7e3] transition-colors"
        >
          Back to Hita
        </Link>
      </motion.div>
    </main>
  );
}
