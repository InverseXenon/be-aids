"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check } from "lucide-react";
import Image from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary-client";

export default function VotingGrid({ question, batchmates, onVote, disabled }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return batchmates;
    const q = search.toLowerCase();
    return batchmates.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.rollNo && b.rollNo.toLowerCase().includes(q))
    );
  }, [batchmates, search]);

  const handleSubmit = async () => {
    if (!selectedId || submitting || disabled) return;
    setSubmitting(true);
    await onVote(selectedId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Film grain */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Header with question */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto"
        >
          <p className="text-amber-400/60 text-xs uppercase tracking-[0.2em] mb-2">
            Who is most likely to...
          </p>
          <h2 className="font-serif text-xl md:text-2xl text-white leading-tight">
            {question?.prompt}
          </h2>
        </motion.div>

        {/* Search bar */}
        <div className="max-w-md mx-auto mt-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/30 transition"
            />
          </div>
        </div>
      </div>

      {/* Batchmate grid */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pb-28">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((b, i) => (
              <motion.button
                key={b._id}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                whileHover={!disabled ? { scale: 1.08, y: -4, zIndex: 10 } : {}}
                whileTap={!disabled ? { scale: 0.92 } : {}}
                transition={{ 
                  delay: Math.min(i, 20) * 0.03,
                  type: "spring", stiffness: 400, damping: 20 
                }}
                onClick={() => !disabled && setSelectedId(b._id)}
                disabled={disabled}
                className={`relative flex flex-col items-center p-2 pt-3 rounded-2xl transition-colors duration-300 ${
                  selectedId === b._id
                    ? "bg-amber-400/10 border-transparent z-10"
                    : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.08]"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Selected animated pulsing ring */}
                {selectedId === b._id && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none"
                    animate={{ 
                      boxShadow: ["0 0 10px rgba(245,158,11,0)", "0 0 30px rgba(245,158,11,0.5)", "0 0 10px rgba(245,158,11,0)"] 
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {/* Selection checkmark */}
                {selectedId === b._id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center z-10"
                  >
                    <Check size={12} className="text-black" strokeWidth={3} />
                  </motion.div>
                )}

                {/* Photo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/5 flex-shrink-0 ring-2 ring-white/10 mb-2">
                  {b.photo?.url ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={b.photo.url}
                      alt={b.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white/20 bg-gradient-to-br from-amber-900/30 to-purple-900/30">
                      {b.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-white/80 text-xs text-center leading-tight line-clamp-2 w-full">
                  {b.name}
                </p>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-white/30 py-8 text-sm">No match found</p>
        )}
      </div>

      {/* Submit button — fixed at bottom */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent pt-12"
          >
            <button
              onClick={handleSubmit}
              disabled={submitting || disabled}
              className="w-full max-w-md mx-auto block py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                  />
                  Submitting...
                </span>
              ) : (
                "Lock In My Vote 🔒"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
