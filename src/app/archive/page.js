"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, FolderOpen, FileText } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const archiveCategories = ["All", "Exams", "Results", "Notices", "Trips", "Hackathons", "Projects", "Other"];

export default function ArchivePage() {
  const [items, setItems] = useState([]);
  const [year, setYear] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    fetch(`/api/archive?${params}`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, [year, category, search]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">Archive 🗂️</h1>
            <p className="text-deep-navy/50">
              Our digital filing cabinet — exams, results, certificates, and more.
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <div className="flex gap-2">
              {[null, 1, 2, 3, 4].map((y) => (
                <button
                  key={y ?? "all"}
                  onClick={() => setYear(y)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-colors ${year === y ? "bg-deep-navy text-parchment" : "bg-warm-sand/50 text-deep-navy/60 hover:bg-warm-sand"}`}
                >
                  {y ? `Year ${y}` : "All Years"}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {archiveCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${category === cat ? "bg-amber-gold text-white" : "bg-warm-sand/50 text-deep-navy/60 hover:bg-warm-sand"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/30" size={16} />
              <input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm rounded-full border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30"
              />
            </div>
          </div>

          {/* File grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="bg-warm-sand/20 rounded-xl p-5 border border-warm-sand/50 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="text-archive-navy/50 flex-shrink-0 mt-0.5" size={20} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-deep-navy truncate">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-deep-navy/40 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="text-xs bg-archive-navy/10 text-archive-navy px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    {item.year && (
                      <span className="text-xs bg-warm-sand/50 text-deep-navy/50 px-2 py-0.5 rounded-full">
                        Y{item.year}
                      </span>
                    )}
                  </div>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-archive-navy/50 hover:text-archive-navy transition-colors"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-20">
              <FolderOpen className="mx-auto text-deep-navy/20 mb-4" size={48} />
              <p className="text-deep-navy/40 font-handwriting text-xl">
                The filing cabinet is empty... for now 📂
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
