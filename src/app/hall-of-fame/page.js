"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";
import Skeleton from "@/components/shared/Skeleton";

function HallOfFameSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-warm-sand/10 rounded-2xl p-6 border border-warm-sand/20 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-40 h-6" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-8 h-4" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("vesit-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("vesit-session-id", id);
  }
  return id;
}

function VotingCard({ category, onVote }) {
  const [voted, setVoted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleVote = async (batchmateId) => {
    if (voted || !category.isOpen) return;
    const sessionId = getSessionId();
    try {
      const res = await fetch("/api/superlatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category._id, batchmateId, sessionId }),
      });
      if (res.ok) {
        setVoted(true);
        setSelectedId(batchmateId);
        onVote();
      } else {
        const data = await res.json();
        if (data.error?.includes("Already voted")) {
          setVoted(true);
        }
      }
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-warm-sand/20 rounded-2xl p-6 border border-warm-sand/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{category.emoji || "🏆"}</span>
        <h3 className="font-serif text-lg font-semibold text-deep-navy">{category.name}</h3>
        {!category.isOpen && (
          <span className="ml-auto flex items-center gap-1 text-xs text-deep-navy/40">
            <Lock size={12} /> Closed
          </span>
        )}
      </div>

      {/* Results */}
      {category.results?.length > 0 && (
        <div className="space-y-2 mb-4">
          {category.results.slice(0, 5).map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-warm-sand/50 overflow-hidden flex-shrink-0">
                {r.batchmate?.photo?.url ? (
                  <img src={optimizeCloudinaryUrl(r.batchmate.photo.url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-deep-navy/30">
                    {r.batchmate?.name?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-deep-navy truncate">{r.batchmate?.name || "Unknown"}</span>
                  <span className="text-deep-navy/40 text-xs ml-2">{r.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-warm-sand/30 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-full ${i === 0 ? "bg-amber-gold" : "bg-dusty-pink/60"}`}
                  />
                </div>
              </div>
              {i === 0 && !category.isOpen && (
                <Trophy className="text-amber-gold flex-shrink-0" size={18} />
              )}
            </div>
          ))}
        </div>
      )}

      {voted && (
        <p className="text-center text-sm text-amber-gold font-handwriting text-lg">
          ✓ You&apos;ve voted!
        </p>
      )}
    </motion.div>
  );
}

export default function HallOfFamePage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = () => {
    setIsLoading(true);
    fetch("/api/superlatives?results=true")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">
              Hall of Fame 🏆
            </h1>
            <p className="text-deep-navy/50 max-w-lg mx-auto">
              Vote for your batchmates in fun categories. May the most deserving win!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <HallOfFameSkeleton />
            ) : (
              categories.map((cat) => (
                <VotingCard key={cat._id} category={cat} onVote={loadCategories} />
              ))
            )}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-deep-navy/40 py-20 font-handwriting text-xl">
              Voting categories coming soon! 🎉
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
