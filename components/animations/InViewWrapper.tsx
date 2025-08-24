"use client";

import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface InViewWrapperProps {
  children: ReactNode;
  animationClass?: string; 
  triggerOnce?: boolean;  
  delay?: string;
}

export default function InViewWrapper({ 
  children,
  animationClass = "animate-in fade-in",
  triggerOnce = true,
  delay,
}: InViewWrapperProps) {
  const { ref, inView } = useInView({
    triggerOnce,
    threshold: 0.4,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in-out ${
        inView ? `${animationClass} ${delay || ""}` : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
