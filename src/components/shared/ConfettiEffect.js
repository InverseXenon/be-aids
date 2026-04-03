"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ConfettiEffect({ fire = false }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!fire) return;
    const colors = ["#EF9F27", "#ED93B1", "#D4F1E4", "#E8DAFF", "#FFF9C4"];
    const p = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(p);
  }, [fire]);

  if (!fire || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-10vh", x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", rotate: 360, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
