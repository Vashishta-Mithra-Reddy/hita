// components/FadeInWhenVisible.tsx
'use client';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  className?: string;  // Add className prop here
}

export default function FadeInWhenVisible({ children, className = '' }: FadeInWhenVisibleProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 }); // Detect both enter and exit

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeOut' },
      });
    } else {
      controls.start({
        opacity: 0,
        y: 30,
        scale: 0.95,
        transition: { duration: 0.5, ease: 'easeIn' },
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={controls}
      className={className}  // Apply the className here
    >
      {children}
    </motion.div>
  );
}
