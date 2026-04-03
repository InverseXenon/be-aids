"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BloopersPage() {
  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* VHS scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-20"
      >
        <p className="text-amber-gold/60 text-sm tracking-widest uppercase mb-4">🎬 secret unlocked</p>
        <h1 className="font-serif text-4xl md:text-6xl text-parchment mb-4">Bloopers Reel</h1>
        <p className="font-handwriting text-xl text-parchment/50 mb-8">
          The moments we weren&apos;t supposed to remember... but did anyway 😂
        </p>
        <div className="bg-parchment/5 border border-parchment/10 rounded-2xl p-8 max-w-lg mx-auto backdrop-blur">
          <p className="text-parchment/40 text-sm mb-4">
            🚧 Bloopers are being collected from the batch...
          </p>
          <p className="font-handwriting text-lg text-amber-gold/60">
            Coming soon. Stay tuned for the chaos.
          </p>
        </div>
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-parchment/30 hover:text-parchment transition-colors"
        >
          ← Back to the real world
        </Link>
      </motion.div>
    </div>
  );
}
