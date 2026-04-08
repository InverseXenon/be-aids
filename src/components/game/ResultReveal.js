"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary-client";

// Confetti particle component
function ConfettiParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#ec4899", "#3b82f6", "#fbbf24"];
    const shapes = ["circle", "square", "triangle"];
    const p = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      size: 6 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 200,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            y: "-5vh",
            x: `${p.x}vw`,
            opacity: 1,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            y: "110vh",
            x: `${p.x + p.drift / 10}vw`,
            rotate: 360 + Math.random() * 360,
            opacity: [1, 1, 0],
            scale: [1, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "2px" : "0",
            clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default function ResultReveal({ winner, question, voteResults, totalVotes }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [phase, setPhase] = useState(0); // 0: dark, 1: spotlight, 2: info, 3: bars

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // Spotlight on
      setTimeout(() => setPhase(2), 1200),   // Name + badge
      setTimeout(() => setPhase(3), 2000),   // Vote bars
      setTimeout(() => setShowConfetti(true), 1500), // Confetti
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const winnerPercentage =
    voteResults?.[0]?.percentage || (totalVotes > 0 ? 100 : 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050507] overflow-y-auto">
      {/* Confetti */}
      {showConfetti && <ConfettiParticles />}

      {/* Spotlight effect */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 40%, transparent 70%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center px-6 max-w-lg mx-auto py-12">
        {/* Question badge */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="mb-6"
            >
              <div className="bg-amber-400/10 border border-amber-400/20 rounded-full px-5 py-2">
                <p className="text-amber-400/80 text-xs sm:text-sm text-center font-medium">
                  {question?.prompt}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner photo with spotlight */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={
            phase >= 1
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.1 }}
          className="relative mb-6"
        >
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-3 rounded-full border-2 border-amber-400/30"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="absolute -inset-6 rounded-full border border-amber-400/15"
          />

          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 ring-amber-400/60 shadow-[0_0_60px_rgba(245,158,11,0.3)]">
            {winner?.photo?.url ? (
              <Image
                loader={cloudinaryLoader}
                src={winner.photo.url}
                alt={winner.name || "Winner"}
                width={176}
                height={176}
                className="w-full h-full object-cover"
                sizes="176px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-amber-400/30 bg-gradient-to-br from-amber-900/30 to-purple-900/30">
                {winner?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Trophy badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={phase >= 2 ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl shadow-lg"
          >
            🏆
          </motion.div>
        </motion.div>

        {/* Winner name */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.h2
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl text-white text-center mb-2"
            >
              {winner?.name || "Unknown"}
            </motion.h2>
          )}
        </AnimatePresence>

        {/* Vote count */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/40 text-sm mb-8"
            >
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast
            </motion.p>
          )}
        </AnimatePresence>

        {/* Vote result bars */}
        <AnimatePresence>
          {phase >= 3 && voteResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm space-y-3"
            >
              {voteResults.slice(0, 5).map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  {/* Mini photo */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 flex-shrink-0 ring-1 ring-white/10">
                    {r.batchmate?.photo?.url ? (
                      <Image
                        loader={cloudinaryLoader}
                        src={r.batchmate.photo.url}
                        alt=""
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/20">
                        {r.batchmate?.name?.[0]}
                      </div>
                    )}
                  </div>

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`truncate ${i === 0 ? "text-amber-400 font-semibold" : "text-white/70"}`}>
                        {r.batchmate?.name || "Unknown"}
                      </span>
                      <span className="text-white/40 text-xs ml-2 flex-shrink-0">
                        {r.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percentage}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          i === 0
                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                            : "bg-white/20"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
