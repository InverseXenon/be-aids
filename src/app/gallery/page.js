"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function Lightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
        <X size={28} />
      </button>
      {item.type === "video" ? (
        <iframe
          src={item.url.replace("watch?v=", "embed/")}
          className="w-full max-w-4xl aspect-video rounded-lg"
          allowFullScreen
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img src={item.url} alt={item.caption || ""} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      )}
      {item.caption && <p className="absolute bottom-6 text-white/60 text-sm">{item.caption}</p>}
    </motion.div>
  );
}

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [search, setSearch] = useState("");
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeYear) params.set("year", activeYear);
    if (search) params.set("tag", search);
    fetch(`/api/gallery?${params}`)
      .then((r) => r.json())
      .then(setMedia)
      .catch(() => {});
  }, [activeYear, search]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">Media Vault</h1>
            <p className="text-deep-navy/50">Photos and videos from four unforgettable years.</p>
          </motion.div>

          {/* Year tabs + search */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="flex gap-2">
              {[null, 1, 2, 3, 4].map((y) => (
                <button
                  key={y ?? "all"}
                  onClick={() => setActiveYear(y)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-colors ${activeYear === y ? "bg-deep-navy text-parchment" : "bg-warm-sand/50 text-deep-navy/60 hover:bg-warm-sand"}`}
                >
                  {y ? `Year ${y}` : "All"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/30" size={16} />
              <input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm rounded-full border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30"
              />
            </div>
          </div>

          {/* Masonry grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {media.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => setLightboxItem(item)}
              >
                <div className="relative rounded-xl overflow-hidden border border-warm-sand/50 hover:shadow-lg transition-shadow">
                  {item.type === "video" ? (
                    <div className="aspect-video bg-deep-navy/10 flex items-center justify-center">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Play className="text-deep-navy/30" size={40} />
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="text-white" size={32} />
                      </div>
                    </div>
                  ) : (
                    <img src={item.url} alt={item.caption || ""} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  {item.eventName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                      <p className="text-white text-xs font-medium">{item.eventName}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {media.length === 0 && (
            <p className="text-center text-deep-navy/40 py-20 font-handwriting text-xl">
              The vault is empty... upload some memories! 📸
            </p>
          )}
        </div>
      </main>
      <Footer />

      <AnimatePresence>
        {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}
      </AnimatePresence>
    </>
  );
}
