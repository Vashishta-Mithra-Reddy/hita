"use client";
import { motion } from "framer-motion";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center wrapperx min-h-screen">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 375 375"
        className="h-16 w-16"
        role="img"
        aria-label="Loading"
        fill="#545454"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 360 }}
        exit={{ scale: 0, opacity: 0, rotate: 0 }} 
        transition={{
          scale: { duration: 0.5, ease: "easeOut" },
          opacity: { duration: 0.5, ease: "easeOut" },
          rotate: { duration: 4, ease: "backOut", repeat: Infinity },
        }}        
      >
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(45 187.5 187.5)" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(90 187.5 187.5)" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(135 187.5 187.5)" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(180 187.5 187.5)" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(225 187.5 187.5)" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(270 187.5 187.5)" />
        <rect x="176.5" y="59.5" width="22" height="72" rx="9" ry="9" transform="rotate(315 187.5 187.5)" />
      </motion.svg>
    </div>
  );
}
