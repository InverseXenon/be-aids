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
  const rotation = useMemo(() => Math.random() * 6 - 3, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.5 }}
      style={{ rotate: rotation }}
      className="group relative h-[28rem] cursor-pointer [perspective:1000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div 
        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-in-out shadow-lg group-hover:shadow-2xl rounded-sm"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Front of Polaroid - Fixed Paper Look */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-[#fcfaf2] p-4 pb-28 border border-warm-sand/30 rounded-sm flex flex-col shadow-[inset_0_0_60px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Decorative Tape Sticker */}
          <div className="absolute top-0 right-[-10px] w-20 h-8 bg-white/40 backdrop-blur-sm border border-white/20 rotate-[25deg] z-20 shadow-sm opacity-60" />
          
          <div className="flex-1 bg-[#1a1a1b] overflow-hidden relative shadow-inner ring-1 ring-black/10">
            {batchmate.photo?.url ? (
              <img
                src={optimizeCloudinaryUrl(batchmate.photo.url)}
                alt={batchmate.name}
                className="w-full h-full object-cover filter contrast-[1.02] saturate-[0.95] brightness-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white/20 bg-gradient-to-br from-deep-navy via-archive-navy to-deep-navy">
                {getInitials(batchmate.name)}
              </div>
            )}
            {batchmate.superlativeTitle && (
              <div className="absolute bottom-2 right-2 bg-amber-600/90 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center text-white text-sm border border-white/30 shadow-lg" title={batchmate.superlativeTitle}>
                🏆
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-28 flex flex-col items-center justify-center px-4 py-2 pointer-events-none">
            <h3 className="font-serif text-xl font-bold text-slate-800 mb-1 tracking-tight truncate w-full text-center">{batchmate.name}</h3>
            <p className="font-handwriting text-lg text-slate-600 line-clamp-2 text-center leading-snug italic max-w-[90%]">
              {batchmate.quote ? `"${batchmate.quote}"` : "Graduating soon..."}
            </p>
          </div>
        </div>

        {/* Back of Polaroid - Memory Notebook Look */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] bg-[#f8f5f0] text-slate-900 p-6 border border-warm-sand/50 rounded-sm flex flex-col items-center justify-center text-center overflow-hidden" 
          style={{ 
            transform: "rotateY(180deg)",
            backgroundImage: "linear-gradient(#EAE3D2 1px, transparent 1px)",
            backgroundSize: "100% 1.8rem"
          }}
        >
          {/* Paper texture and margin line */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute left-[2.5rem] top-0 bottom-0 w-[1px] bg-red-400/20" />
          
          <h3 className="font-serif text-xl font-bold text-deep-navy mb-1 relative z-10">{batchmate.name}</h3>
          {batchmate.superlativeTitle && (
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-4 border-b border-amber-700/20 pb-1 relative z-10">
              {batchmate.superlativeTitle}
            </p>
          )}
          
          <div className="flex-1 w-full max-h-[220px] overflow-y-auto px-2 py-4 scrollbar-hide relative z-10">
            {batchmate.bio ? (
              <p className="font-sans text-sm text-slate-800 leading-[1.8rem] text-justify italic">
                {batchmate.bio}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic leading-[1.8rem]">Waiting for a story... ✨</p>
            )}
          </div>
          
          <div className="flex gap-5 mt-6 relative z-10 pt-4 border-t border-warm-sand/40">
            {batchmate.linkedin && (
              <a onClick={e => e.stopPropagation()} href={batchmate.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-600/10 text-blue-700 rounded-full hover:bg-blue-600/20 transition-all hover:scale-110 shadow-sm">
                <Linkedin size={20} />
              </a>
            )}
            {batchmate.instagram && (
              <a onClick={e => e.stopPropagation()} href={batchmate.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-pink-600/10 text-pink-700 rounded-full hover:bg-pink-600/20 transition-all hover:scale-110 shadow-sm">
                <Instagram size={20} />
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
