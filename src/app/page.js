"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Star, Plane, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Skeleton from "@/components/shared/Skeleton";
import Lightbox from "@/components/shared/Lightbox";
import { cloudinaryLoader } from "@/lib/cloudinary-client";

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
          className="absolute text-amber-gold/20 pointer-events-none will-change-transform"
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
      className="mt-6 bg-parchment/80 dark:bg-warm-sand/30 backdrop-blur rounded-xl px-6 py-3 max-w-md text-center border border-amber-gold/20"
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

/* ── vault highlights carousel — infinite marquee ── */
function VaultHighlightsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4 md:px-20 py-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[280px] md:min-w-[340px] h-[450px] shrink-0 rounded-2xl overflow-hidden border border-warm-sand/20 bg-warm-sand/5 relative">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute inset-x-6 bottom-8 space-y-3">
             <Skeleton className="h-4 w-1/4" />
             <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VaultHighlights() {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);
  
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/gallery")
      .then(r => r.json())
      .then(data => {
        const images = data.filter(d => d.type === "image" || d.thumbnail);
        // Shuffle the array to get random moments
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        setMedia(shuffled.slice(0, 10));
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
  }, []);

  if (!isLoading && media.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden bg-warm-sand/5">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-serif text-3xl md:text-4xl text-center text-deep-navy">Random Highlights</h2>
          <p className="text-center text-deep-navy/60 mt-2">Reliving beautiful, random moments from our journey.</p>
        </motion.div>
      </div>
      
      {isLoading ? (
        <VaultHighlightsSkeleton />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory px-4 md:px-20 scrollbar-hide">
          {media.map((item) => (
            <div 
              onClick={() => setLightboxItem(item)}
              key={item._id} 
              className="cursor-pointer min-w-[280px] md:min-w-[340px] h-[450px] snap-center shrink-0 relative rounded-2xl overflow-hidden group shadow-lg border border-warm-sand/50"
            >
              <Image
                loader={cloudinaryLoader}
                src={item.thumbnail || item.url}
                alt={item.caption || "A beautiful memory"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="340px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                {item.eventName && <p className="text-amber-gold text-xs font-bold uppercase tracking-wider mb-1">{item.eventName}</p>}
                <p className="text-white/90 text-sm line-clamp-2">{item.caption || "A beautiful memory"}</p>
                <div className="flex items-center gap-1 mt-3">
                   <svg className="w-4 h-4 text-dusty-pink fill-dusty-pink" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                   <span className="text-xs text-white border-l border-white/20 pl-2 ml-1">{item.likesCount || 0} Likes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxItem && (
          <Lightbox 
            item={lightboxItem} 
            media={media} 
            onNavigate={setLightboxItem} 
            onClose={() => setLightboxItem(null)} 
          />
        )}
      </AnimatePresence>
    </section>
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

        <VaultHighlights />

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
              { href: "/admin", label: "Admin", emoji: "🔐", color: "bg-archive-navy/10" },
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
