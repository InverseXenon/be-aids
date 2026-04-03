"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Tag, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const yearColors = {
  1: { bg: "bg-year1", border: "border-amber-gold", dot: "bg-amber-gold", label: "Year 1 · 2022–23" },
  2: { bg: "bg-year2", border: "border-dusty-pink", dot: "bg-dusty-pink", label: "Year 2 · 2023–24" },
  3: { bg: "bg-year3", border: "border-sticky-mint", dot: "bg-archive-navy", label: "Year 3 · 2024–25" },
  4: { bg: "bg-deep-navy/5", border: "border-deep-navy", dot: "bg-deep-navy", label: "Year 4 · 2025–26" },
};

const categories = ["All", "Academics", "Cultural", "Sports", "Trips", "Hackathons", "Farewell", "Other"];

function Lightbox({ photos, index, onClose, onNav }) {
  if (index < 0 || !photos.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-50">
        <X size={28} />
      </button>
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onNav(-1); }} className="absolute left-4 text-white/80 hover:text-white">
            <ChevronLeft size={36} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNav(1); }} className="absolute right-4 text-white/80 hover:text-white">
            <ChevronRight size={36} />
          </button>
        </>
      )}
      {(photos[index]?.url.includes('/video/') || photos[index]?.url.match(/\.(mp4|webm|ogg)$/i)) ? (
        <video
          src={photos[index]?.url}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={photos[index]?.url}
          alt=""
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <p className="absolute bottom-4 text-white/50 text-sm">
        {index + 1} / {photos.length}
      </p>
    </motion.div>
  );
}

function EventCard({ event, side }) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const colors = yearColors[event.year] || yearColors[1];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className={`relative w-full md:w-[calc(50%-2rem)] ${side === "left" ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}
      >
        <div className={`${colors.bg} ${colors.border} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
          {/* Date & Category */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-deep-navy/50">
              <Calendar size={12} />
              {new Date(event.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1 text-xs bg-deep-navy/10 text-deep-navy/70 px-2 py-0.5 rounded-full">
              <Tag size={10} />
              {event.category}
            </span>
          </div>

          <h3 className="font-serif text-lg font-semibold text-deep-navy mb-2">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-deep-navy/60 leading-relaxed mb-3">{event.description}</p>
          )}

          {/* Photo thumbnails */}
          {event.photos?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {event.photos.slice(0, 4).map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/50 hover:border-amber-gold transition-colors relative bg-black/10"
                >
                  {(photo.url.includes('/video/') || photo.url.match(/\.(mp4|webm|ogg)$/i)) ? (
                    <>
                      <video src={photo.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center pl-0.5">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-deep-navy"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
              {event.photos.length > 4 && (
                <button
                  onClick={() => setLightboxIndex(4)}
                  className="w-16 h-16 rounded-lg bg-deep-navy/10 flex items-center justify-center text-sm text-deep-navy/60 font-medium"
                >
                  +{event.photos.length - 4}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <Lightbox
            photos={event.photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(-1)}
            onNav={(dir) =>
              setLightboxIndex((prev) =>
                (prev + dir + event.photos.length) % event.photos.length
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function TimelinePage() {
  const [events, setEvents] = useState([]);
  const [filterYear, setFilterYear] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterYear) params.set("year", filterYear);
    if (filterCategory !== "All") params.set("category", filterCategory);
    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, [filterYear, filterCategory]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">Our Journey</h1>
            <p className="text-deep-navy/50 max-w-lg mx-auto">
              Four years of memories, milestones, and moments that shaped us.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {/* Year filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterYear(null)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${!filterYear ? "bg-deep-navy text-parchment" : "bg-warm-sand/50 text-deep-navy/60 hover:bg-warm-sand"}`}
              >
                All Years
              </button>
              {[1, 2, 3, 4].map((y) => (
                <button
                  key={y}
                  onClick={() => setFilterYear(y)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${filterYear === y ? "bg-deep-navy text-parchment" : "bg-warm-sand/50 text-deep-navy/60 hover:bg-warm-sand"}`}
                >
                  Year {y}
                </button>
              ))}
            </div>
            {/* Category filters */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${filterCategory === cat ? "bg-amber-gold text-white" : "bg-warm-sand/50 text-deep-navy/60 hover:bg-warm-sand"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-warm-sand -translate-x-1/2" />

            <div className="space-y-8">
              {events.length === 0 && (
                <p className="text-center text-deep-navy/40 py-20 font-handwriting text-xl">
                  No events yet... memories are being collected ✨
                </p>
              )}
              {events.map((event, i) => (
                <div key={event._id} className="relative">
                  {/* Center dot */}
                  <div
                    className={`hidden md:block absolute left-1/2 top-6 w-4 h-4 rounded-full -translate-x-1/2 border-2 border-parchment ${yearColors[event.year]?.dot || "bg-amber-gold"}`}
                  />
                  <EventCard event={event} side={i % 2 === 0 ? "left" : "right"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
