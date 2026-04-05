"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronLeft, ChevronRight, Play, Upload, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSessionId, getUserName, setUserName } from "@/lib/session";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";
import Skeleton from "@/components/shared/Skeleton";

function GallerySkeleton() {
  const heights = ["h-64", "h-48", "h-72", "h-56", "h-80"];
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="break-inside-avoid">
          <Skeleton className={`${heights[i % heights.length]} w-full rounded-xl`} />
        </div>
      ))}
    </div>
  );
}

function Interactions({ targetId }) {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setName(getUserName());
    fetch(`/api/interactions?targetId=${targetId}`)
      .then(r => r.json())
      .then(data => {
        setLikes(data.likesCount || 0);
        setComments(data.comments || []);
      }).catch(() => {});
  }, [targetId]);

  const handleLike = async () => {
    const sessionId = getSessionId();
    const res = await fetch("/api/interactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", targetId, sessionId })
    });
    if (res.ok) {
      const data = await res.json();
      setLikes(data.likesCount);
      setHasLiked(data.action === "liked");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    let authorName = name.trim();
    if (!authorName) {
      authorName = prompt("Enter your display name for comments:");
      if (!authorName) return;
      setUserName(authorName);
      setName(authorName);
    }
    
    const res = await fetch("/api/interactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", targetId, text: newComment, authorName })
    });
    if (res.ok) {
      const added = await res.json();
      setComments([added, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="w-full max-w-md bg-warm-sand/10 rounded-xl p-4 mt-4 text-parchment overflow-hidden flex flex-col max-h-[300px]">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${hasLiked ? "text-dusty-pink" : "text-white/70 hover:text-white"}`}>
          <svg className="w-5 h-5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          <span className="text-sm">{likes}</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2 scrollbar-thin">
        {comments.map(c => (
          <div key={c._id} className="bg-warm-sand/20 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-amber-gold text-xs">{c.authorName}</span>
            </div>
            <p className="text-sm text-white/90">{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-white/50 italic text-center">No comments yet. Be the first!</p>}
      </div>
      <form onSubmit={handleComment} className="flex gap-2">
        <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-gold border-none text-white placeholder:text-white/50" />
        <button type="submit" disabled={!newComment.trim()} className="px-3 py-2 bg-amber-gold/20 text-amber-gold rounded-lg text-sm font-medium hover:bg-amber-gold/30 disabled:opacity-50">Post</button>
      </form>
    </div>
  );
}

function Lightbox({ item, media, onNavigate, onClose }) {
  if (!item) return null;
  const currentIndex = media.findIndex(m => m._id === item._id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < media.length - 1;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (hasPrev) onNavigate(media[currentIndex - 1]);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (hasNext) onNavigate(media[currentIndex + 1]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex md:flex-row flex-col items-center justify-center p-4 gap-6"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-50">
        <X size={28} />
      </button>

      {hasPrev && (
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all">
          <ChevronLeft size={32} />
        </button>
      )}
      {hasNext && (
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all">
          <ChevronRight size={32} />
        </button>
      )}
      
      <div className="flex-1 flex items-center justify-center w-full max-h-[85vh]">
        {item.type === "video" ? (
          <iframe
            src={item.url.replace("watch?v=", "embed/")}
            className="w-full max-w-4xl aspect-video rounded-lg"
            allowFullScreen
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img src={optimizeCloudinaryUrl(item.url)} alt={item.caption || ""} className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        )}
      </div>

      <div className="w-full md:w-80 lg:w-96 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
        {item.caption && <p className="text-white/80 text-sm mb-4 bg-warm-sand/20 p-4 rounded-xl">{item.caption}</p>}
        {item.eventName && <p className="text-amber-gold text-xs font-bold uppercase tracking-wider mb-2">{item.eventName}</p>}
        <Interactions targetId={item._id} />
      </div>
    </motion.div>
  );
}

function ContributeModal({ onClose, onSubmitted }) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ eventName: "", caption: "", year: "1" });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "vesit-aids/gallery");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.url,
          publicId: data.publicId,
          type: "photo",
          year: parseInt(form.year),
          eventName: form.eventName,
          caption: form.caption,
          tags: [],
          approved: false
        })
      });

      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 2000);
    } catch (err) {}
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-parchment dark:bg-deep-navy w-full max-w-md rounded-2xl shadow-xl overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-warm-sand/50 flex justify-between items-center">
          <h2 className="font-serif text-xl text-deep-navy dark:text-parchment">Contribute Photo ✨</h2>
          <button onClick={onClose} className="text-deep-navy/50 hover:text-deep-navy p-1"><X size={20}/></button>
        </div>
        <div className="p-6">
          {success ? (
             <div className="flex flex-col items-center justify-center py-8 text-center">
               <CheckCircle2 size={48} className="text-green-500 mb-4" />
               <h3 className="font-serif text-lg text-deep-navy">Photo Submitted!</h3>
               <p className="text-sm text-deep-navy/60 mt-2">Thank you! Admin will review and approve it shortly.</p>
             </div>
          ) : (
            <div className="space-y-4">
              <div>
                 <label className="text-xs font-semibold text-deep-navy/60 uppercase mb-1 block">Memory Name / Event</label>
                 <input className="w-full px-4 py-2 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:ring-2 focus:ring-amber-gold" 
                        value={form.eventName} onChange={e => setForm({...form, eventName: e.target.value})} placeholder="e.g. Freshers Party" />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="text-xs font-semibold text-deep-navy/60 uppercase mb-1 block">Year</label>
                   <select className="w-full px-4 py-2 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:ring-2 focus:ring-amber-gold"
                           value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
                     <option value="1">Year 1</option>
                     <option value="2">Year 2</option>
                     <option value="3">Year 3</option>
                     <option value="4">Year 4</option>
                   </select>
                 </div>
              </div>
              <div>
                 <label className="text-xs font-semibold text-deep-navy/60 uppercase mb-1 block">Caption (Optional)</label>
                 <textarea className="w-full px-4 py-2 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:ring-2 focus:ring-amber-gold min-h-[80px]" 
                           value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} placeholder="Add a lovely caption..." />
              </div>
              
              <div className="mt-6 pt-6 border-t border-warm-sand/50">
                 <label className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors font-medium cursor-pointer ${uploading || !form.eventName ? 'bg-warm-sand/50 text-deep-navy/30 cursor-not-allowed' : 'bg-deep-navy text-parchment hover:bg-archive-navy'}`}>
                    <Upload size={18} />
                    {uploading ? "Uploading securely..." : "Select & Upload Photo"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading || !form.eventName} onChange={handleUpload} />
                 </label>
                 {!form.eventName && <p className="text-center text-xs text-red-400 mt-2">Please provide a memory name first</p>}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [search, setSearch] = useState("");
  const [lightboxItem, setLightboxItem] = useState(null);
  const [showContribute, setShowContribute] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (activeYear) params.set("year", activeYear);
    if (search) params.set("tag", search);
    fetch(`/api/gallery?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMedia(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
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
                className="pl-9 pr-4 py-1.5 text-sm rounded-full border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30"
              />
            </div>
          </div>

          {/* Masonry grid */}
          {isLoading ? (
            <GallerySkeleton />
          ) : (
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
                      <img src={optimizeCloudinaryUrl(item.url)} alt={item.caption || ""} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          )}

          {media.length === 0 && (
            <p className="text-center text-deep-navy/40 py-20 font-handwriting text-xl">
              The vault is empty... upload some memories! 📸
            </p>
          )}
        </div>
      </main>
      <Footer />

      <AnimatePresence>
        {lightboxItem && (
          <Lightbox 
            item={lightboxItem} 
            media={media} 
            onNavigate={setLightboxItem} 
            onClose={() => setLightboxItem(null)} 
          />
        )}
        {showContribute && (
          <ContributeModal 
            onClose={() => setShowContribute(false)}
            onSubmitted={() => {
              // Optionally fetch or just wait for admin approval
            }}
          />
        )}
      </AnimatePresence>

      <button 
        onClick={() => setShowContribute(true)}
        className="fixed bottom-8 right-8 bg-amber-gold text-deep-navy p-4 rounded-full shadow-xl hover:scale-105 transition-all flex items-center group z-40"
      >
        <Upload size={20} className="shrink-0" />
        <span className="font-semibold text-sm max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2">
          Contribute Photos
        </span>
      </button>
    </>
  );
}
