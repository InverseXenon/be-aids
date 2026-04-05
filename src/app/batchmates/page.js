"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

// Inline SVGs for social icons to fix build error
const Linkedin = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Instagram = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";
import { useMemo } from "react";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function ProfileCard({ batchmate, index }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useMemo(() => Math.random() * 4 - 2, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.5 }}
      style={{ rotate: rotation }}
      className="group relative h-80 cursor-pointer [perspective:1000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div 
        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-600 ease-out shadow-lg group-hover:shadow-2xl rounded-sm"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Front of Polaroid */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-[#fdfbf6] p-3 pb-16 border border-warm-sand/40 rounded-sm flex flex-col shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
          {/* Tape Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-16 h-6 bg-white/40 backdrop-blur-sm border border-white/20 rotate-[-2deg] z-10 shadow-sm" />
          
          <div className="flex-1 bg-[#1a1a1a] overflow-hidden relative shadow-inner">
            {batchmate.photo?.url ? (
              <img
                src={optimizeCloudinaryUrl(batchmate.photo.url)}
                alt={batchmate.name}
                className="w-full h-full object-cover filter contrast-[1.05] saturate-[0.9] sepia-[0.1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20 bg-gradient-to-br from-deep-navy to-archive-navy">
                {getInitials(batchmate.name)}
              </div>
            )}
            {batchmate.superlativeTitle && (
              <div className="absolute bottom-2 right-2 bg-amber-gold/90 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-white text-xs border border-white/20" title={batchmate.superlativeTitle}>
                🏆
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center pointer-events-none">
            <h3 className="font-handwriting text-2xl text-[#1F2937] truncate px-4">{batchmate.name}</h3>
          </div>
        </div>

        {/* Back of Polaroid */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] bg-[#f8f5f0] dark:bg-[#1c1a18] p-5 border border-warm-sand/50 rounded-sm flex flex-col items-center justify-center text-center overflow-hidden" 
          style={{ transform: "rotateY(180deg)" }}
        >
          {/* Subtle pattern background for the back */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <h3 className="font-serif text-xl font-bold text-deep-navy mb-1 relative z-10">{batchmate.name}</h3>
          {batchmate.superlativeTitle && (
            <p className="text-amber-gold text-xs font-semibold uppercase tracking-widest mb-3 border-b border-amber-gold/20 pb-2 relative z-10">
              {batchmate.superlativeTitle}
            </p>
          )}
          {batchmate.quote ? (
            <p className="font-handwriting text-lg text-deep-navy/80 mb-4 line-clamp-5 italic relative z-10 leading-snug">
              "{batchmate.quote}"
            </p>
          ) : (
            <p className="text-sm text-deep-navy/40 italic mb-4 relative z-10">Waiting for a witty quote...</p>
          )}
          
          <div className="flex gap-4 mt-auto relative z-10">
            {batchmate.linkedin && (
              <a onClick={e => e.stopPropagation()} href={batchmate.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-archive-navy/10 text-archive-navy rounded-full hover:bg-archive-navy/20 transition-all hover:scale-110">
                <Linkedin size={18} />
              </a>
            )}
            {batchmate.instagram && (
              <a onClick={e => e.stopPropagation()} href={batchmate.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-dusty-pink/10 text-dusty-pink rounded-full hover:bg-dusty-pink/20 transition-all hover:scale-110">
                <Instagram size={18} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BatchmatesPage() {
  const [batchmates, setBatchmates] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/batchmates?${params}`)
      .then((r) => r.json())
      .then(setBatchmates)
      .catch(() => {});
  }, [search]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">
              Meet the Class
            </h1>
            <p className="text-deep-navy/50 max-w-lg mx-auto">
              The brilliant minds of Batch &apos;26. Hover to see their superpowers.
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/30" size={18} />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30 focus:border-amber-gold/50 transition"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {batchmates.map((b, i) => (
              <ProfileCard key={b._id} batchmate={b} index={i} />
            ))}
          </div>

          {batchmates.length === 0 && (
            <p className="text-center text-deep-navy/40 py-20 font-handwriting text-xl">
              No batchmates added yet... stay tuned! ✨
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
