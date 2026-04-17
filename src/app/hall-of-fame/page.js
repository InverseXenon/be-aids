"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function HallOfFamePage() {
  const [liveGame, setLiveGame] = useState(false);

  useEffect(() => {
    fetch("/api/game")
      .then((r) => r.json())
      .then((data) => setLiveGame(data.active))
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">
              Live Game 🎮
            </h1>
            <p className="text-deep-navy/50">
              Who Is Most Likely To...? — vote live with your batchmates!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Link
              href="/hall-of-fame/game"
              className={`block border rounded-2xl p-8 transition-all group ${
                liveGame
                  ? "bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-amber-500/10 border-amber-400/40 hover:border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
                  : "bg-warm-sand/20 border-warm-sand/50 hover:border-warm-sand/90"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-5">
                <motion.div
                  animate={liveGame ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    liveGame
                      ? "bg-amber-400/20 text-amber-500"
                      : "bg-deep-navy/5 text-deep-navy/40"
                  }`}
                >
                  <Gamepad2 size={40} />
                </motion.div>

                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-deep-navy font-semibold mb-2 flex items-center justify-center gap-2">
                    {liveGame ? (
                      <>
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        Live Game Is Active!
                      </>
                    ) : (
                      "Who Is Most Likely To...?"
                    )}
                  </h2>
                  <p className="text-deep-navy/60 text-base">
                    {liveGame
                      ? "Join now — tap to play with everyone!"
                      : "Game will be hosted live tonight. Stay tuned!"}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
                    liveGame
                      ? "bg-amber-400 text-black group-hover:bg-amber-300"
                      : "bg-deep-navy text-parchment group-hover:bg-archive-navy"
                  }`}
                >
                  {liveGame ? <Zap size={16} /> : <ArrowRight size={16} />}
                  {liveGame ? "Join Now" : "Enter Game Room"}
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
