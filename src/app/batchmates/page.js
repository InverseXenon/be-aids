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

function ProfileCard({ batchmate, index }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.5 }}
      className="group relative h-80 cursor-pointer [perspective:1000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div 
        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500 ease-out shadow-md hover:shadow-xl rounded-sm"
        animate={{ rotateY: isFlipped ? 180 : (Math.random() * 4 - 2) }}
        whileHover={{ scale: 1.05, rotateY: 180 }}
      >
        {/* Front of Polaroid */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-[#f8f5f0] dark:bg-[#1c1a18] p-3 pb-16 border border-warm-sand/50 rounded-sm flex flex-col">
          <div className="flex-1 bg-warm-sand/50 overflow-hidden relative shadow-inner">
            {batchmate.photo?.url ? (
              <img
                src={optimizeCloudinaryUrl(batchmate.photo.url)}
                alt={batchmate.name}
                className="w-full h-full object-cover filter contrast-110 saturate-[0.8]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-deep-navy/20">
                {batchmate.name?.[0] || "?"}
              </div>
            )}
            {batchmate.superlativeTitle && (
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-amber-gold" title={batchmate.superlativeTitle}>
                🏆
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center pointer-events-none">
            <h3 className="font-handwriting text-2xl text-deep-navy/80 truncate px-4">{batchmate.name}</h3>
          </div>
        </div>

        {/* Back of Polaroid */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] bg-[#f8f5f0] dark:bg-[#1c1a18] p-5 border border-warm-sand/50 rounded-sm flex flex-col items-center justify-center text-center" 
          style={{ transform: "rotateY(180deg)" }}
        >
          <h3 className="font-serif text-xl font-bold text-deep-navy mb-1">{batchmate.name}</h3>
          {batchmate.superlativeTitle && (
            <p className="text-amber-gold text-xs font-semibold uppercase tracking-widest mb-3 border-b border-amber-gold/20 pb-2">
              {batchmate.superlativeTitle}
            </p>
          )}
          {batchmate.quote ? (
            <p className="font-handwriting text-lg text-deep-navy/70 mb-4 line-clamp-4 italic">
              "{batchmate.quote}"
            </p>
          ) : (
            <p className="text-sm text-deep-navy/40 italic mb-4">No quote added.</p>
          )}
          
          <div className="flex gap-4 mt-auto">
            {batchmate.linkedin && (
              <a href={batchmate.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-archive-navy/10 text-archive-navy rounded-full hover:bg-archive-navy/20 transition-colors">
                <Linkedin size={18} />
              </a>
            )}
            {batchmate.instagram && (
              <a href={batchmate.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-dusty-pink/10 text-dusty-pink rounded-full hover:bg-dusty-pink/20 transition-colors">
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
