"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Star, Plane, ChevronDown } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/* ── floating decorative items ── */
function FloatingElements() {
  const items = [
    { Icon: Plane, left: "10%", top: "20%", delay: 0, size: 24 },
    { Icon: GraduationCap, left: "80%", top: "15%", delay: 1.5, size: 28 },
    { Icon: Star, left: "20%", top: "70%", delay: 3, size: 18 },
    { Icon: Plane, left: "70%", top: "65%", delay: 0.8, size: 20 },
    { Icon: Star, left: "50%", top: "30%", delay: 2.2, size: 16 },
    { Icon: GraduationCap, left: "35%", top: "80%", delay: 4, size: 22 },
    { Icon: Star, left: "90%", top: "50%", delay: 1, size: 14 },
    { Icon: Plane, left: "5%", top: "50%", delay: 2.8, size: 22 },
  ];

  return (
    <>
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-amber-gold/20 pointer-events-none"
          style={{ left: item.left, top: item.top }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, item.Icon === Plane ? 10 : 5, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 6,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}
    </>
  );
}

/* ── countdown timer ── */
function CountdownTimer() {
  const [diff, setDiff] = useState({ days: 0, label: "" });

  useEffect(() => {
    const farewell = new Date("2026-04-17");
    const firstDay = new Date("2022-08-01");
    const update = () => {
      const now = new Date();
      if (now < farewell) {
        const d = Math.ceil((farewell - now) / (1000 * 60 * 60 * 24));
        setDiff({ days: d, label: "Days Until Farewell" });
      } else {
        const d = Math.floor((now - firstDay) / (1000 * 60 * 60 * 24));
        setDiff({ days: d, label: "Days Since It All Began" });
      }
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="mt-10 inline-flex flex-col items-center gap-1 bg-deep-navy/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-deep-navy/10"
    >
      <span className="font-serif text-5xl font-bold text-deep-navy">{diff.days}</span>
      <span className="text-sm text-deep-navy/60 tracking-widest uppercase">{diff.label}</span>
    </motion.div>
  );
}

/* ── "This Day in History" widget ── */
function ThisDayWidget() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((events) => {
        const today = new Date();
        const match = events.find((e) => {
          const d = new Date(e.date);
          return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
        });
        if (match) setEvent(match);
      })
      .catch(() => {});
  }, []);

  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8 }}
      className="mt-6 bg-warm-sand/40 backdrop-blur rounded-xl px-6 py-3 max-w-md text-center border border-amber-gold/20"
    >
      <p className="text-xs text-deep-amber font-medium uppercase tracking-wider mb-1">
        📅 This Day in AIDS History
      </p>
      <p className="text-sm text-deep-navy font-medium">{event.title}</p>
      <p className="text-xs text-deep-navy/50 mt-0.5">
        {new Date(event.date).getFullYear()}
      </p>
    </motion.div>
  );
}

/* ── main page ── */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-parchment via-warm-sand/30 to-parchment">
          <FloatingElements />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-4"
          >
            {/* University */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm md:text-base tracking-[0.3em] uppercase text-deep-amber/70 font-medium mb-4"
            >
              Vivekanand Education Society&apos;s Institute of Technology
            </motion.p>

            {/* Batch name */}
            <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl font-bold text-deep-navy leading-tight">
              Batch &apos;26
            </h1>
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-handwriting text-2xl md:text-3xl text-dusty-pink mt-6"
            >
              Four years. One family. Forever.
            </motion.p>

            <CountdownTimer />
            <ThisDayWidget />

            {/* Batch Anthem placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-8 text-xs text-deep-navy/30 italic"
            >
              🎵 Batch Anthem — Coming Soon
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-deep-navy/30" />
            </motion.div>
          </motion.div>
        </section>

        {/* Quick links grid */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl text-center text-deep-navy mb-12"
          >
            Explore Our Memories
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/timeline", label: "Timeline", emoji: "📜", color: "bg-year1" },
              { href: "/batchmates", label: "Batchmates", emoji: "👥", color: "bg-year2" },
              { href: "/gallery", label: "Gallery", emoji: "📸", color: "bg-sticky-mint" },
              { href: "/yearbook", label: "Yearbook", emoji: "📖", color: "bg-sticky-lavender" },
              { href: "/messages", label: "Messages", emoji: "💌", color: "bg-sticky-lemon" },
              { href: "/hall-of-fame", label: "Hall of Fame", emoji: "🏆", color: "bg-sticky-peach" },
              { href: "/archive", label: "Archive", emoji: "🗂️", color: "bg-warm-sand" },
              { href: "/admin", label: "Admin", emoji: "🔐", color: "bg-blush-rose" },
            ].map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={item.href}
                  className={`${item.color} rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-[1.03] transition-transform shadow-sm hover:shadow-md border border-black/5`}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="font-serif text-sm font-medium text-deep-navy">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
