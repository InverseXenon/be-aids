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

function ProfileCard({ batchmate, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.5 }}
      className="group relative bg-warm-sand/30 rounded-2xl overflow-hidden border border-warm-sand/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Photo */}
      <div className="aspect-[3/4] bg-warm-sand/50 overflow-hidden">
        {batchmate.photo?.url ? (
          <img
            src={batchmate.photo.url}
            alt={batchmate.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-deep-navy/20">
            {batchmate.name?.[0] || "?"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-base font-semibold text-deep-navy truncate">
          {batchmate.name}
        </h3>
        {batchmate.quote && (
          <p className="font-handwriting text-sm text-deep-navy/50 mt-1 line-clamp-2 italic">
            &ldquo;{batchmate.quote}&rdquo;
          </p>
        )}
        {/* Social links */}
        <div className="flex gap-2 mt-3">
          {batchmate.linkedin && (
            <a href={batchmate.linkedin} target="_blank" rel="noopener noreferrer" className="text-archive-navy/50 hover:text-archive-navy transition-colors">
              <Linkedin size={16} />
            </a>
          )}
          {batchmate.instagram && (
            <a href={batchmate.instagram} target="_blank" rel="noopener noreferrer" className="text-dusty-pink/50 hover:text-dusty-pink transition-colors">
              <Instagram size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Superlative hover overlay */}
      {batchmate.superlativeTitle && (
        <div className="absolute inset-0 bg-deep-navy/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="text-center px-4">
            <p className="text-amber-gold text-sm font-medium mb-1">🏆</p>
            <p className="font-handwriting text-xl text-parchment">{batchmate.superlativeTitle}</p>
          </div>
        </div>
      )}
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30 focus:border-amber-gold/50 transition"
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
