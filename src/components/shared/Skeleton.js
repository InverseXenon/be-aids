"use client";
import { motion } from "framer-motion";

export default function Skeleton({ className = "" }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={`bg-warm-sand/20 rounded-md ${className}`}
    />
  );
}
