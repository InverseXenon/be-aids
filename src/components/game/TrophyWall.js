"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary-client";
import { Trophy } from "lucide-react";

export default function TrophyWall({ results }) {
  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <p className="text-white/30">No results yet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4">
      {/* Film grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl mb-4 inline-block"
          >
            🏆
          </motion.div>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">
            Trophy Wall
          </h1>
          <p className="text-white/40 text-sm">
            All the winners from tonight&apos;s game
          </p>
        </motion.div>

        {/* Results grid */}
        <div className="space-y-4">
          {results.map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 150 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.05] transition-colors"
            >
              {/* Index badge */}
              <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 text-sm font-bold">{i + 1}</span>
              </div>

              {/* Winner photo */}
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 flex-shrink-0 ring-2 ring-amber-400/30">
                {r.winner?.photo?.url ? (
                  <Image
                    loader={cloudinaryLoader}
                    src={r.winner.photo.url}
                    alt={r.winner.name || ""}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg text-white/20">
                    {r.winner?.name?.[0] || "?"}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">
                  {r.winner?.name || "No votes"}
                </h3>
                <p className="text-amber-400/60 text-xs mt-0.5 line-clamp-1">
                  {r.prompt}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    />
                  </div>
                  <span className="text-white/30 text-xs flex-shrink-0">
                    {r.percentage}%
                  </span>
                </div>
              </div>

              {/* Trophy icon */}
              <Trophy className="text-amber-400/40 flex-shrink-0" size={20} />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: results.length * 0.1 + 0.5 }}
          className="text-center text-white/20 text-sm mt-10 font-serif"
        >
          ✨ What a game, Batch &apos;26! ✨
        </motion.p>
      </div>
    </div>
  );
}
