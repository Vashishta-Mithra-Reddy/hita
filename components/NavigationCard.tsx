"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

const ArrowIcon = (props: ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

type NavigationCardProps = {
  title: string;
  href: string;
  tag: string;
  image?: string;
  delay: number;
} & Omit<ComponentProps<typeof Link>, "href">;

export default function NavigationCard({
  title,
  image,
  href,
  tag,
  delay,
  className,
}: NavigationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: "easeIn", delay }}
      className={`w-full flex-center max-w-screen font-jakarta`}
    >
      <Link
        href={href}
        className={`
        group relative block overflow-hidden rounded-2xl
        shadow-lg transition-all duration-300
        hover:shadow-xl font-outfit w-full
        ${className}
      `}
      >
        <div className="absolute inset-0">
          <MeshGradient
            colors={["#000000", "#241d9a", "#241d9a"]}
            distortion={0.8}
            swirl={0.1}
            grainMixer={0}
            grainOverlay={0.36}
            speed={1}
            offsetY={-0.28}
            className="h-full w-full object-cover transition-all duration-500 ease-in-out rounded-2xl"
          />
        </div>

        <div className="absolute inset-0 backdrop-blur-xl group-hover:backdrop-blur-none transition-all duration-500 ease-in-out rounded-2xl" />

        <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 md:gap-3 p-8 py-12 text-center text-white">
          {image && (
            <img
              src={image}
              alt={title}
              className="mb-2 w-20 rounded-xl object-contain drop-shadow-md"
            />
          )}

          <h2 className="text-3xl font-semibold drop-shadow-md mx-12">{title}</h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-white/80">
            {tag}
            <ArrowIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
