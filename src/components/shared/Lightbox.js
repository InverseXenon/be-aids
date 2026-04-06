"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { getSessionId, getUserName, setUserName } from "@/lib/session";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";

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

export default function Lightbox({ item, media, onNavigate, onClose }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Reset rotation when image changes
    setRotation(0);

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev(e);
      if (e.key === "ArrowRight") handleNext(e);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, media]); // added media to dependency array if onNavigate needs it, but it's safe

  if (!item) return null;
  const currentIndex = media.findIndex(m => m._id === item._id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < media.length - 1;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (hasPrev) onNavigate(media[currentIndex - 1]);
  };
  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (hasNext) onNavigate(media[currentIndex + 1]);
  };

  const handleRotate = (e) => {
    e.stopPropagation();
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/98 flex md:flex-row flex-col items-center justify-center p-4 gap-4 md:gap-8 cursor-default"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
        {!item.url.includes("watch?v=") && (
          <button onClick={handleRotate} className="text-white/60 hover:text-white transition-colors" title="Rotate Image">
            <RotateCw size={24} />
          </button>
        )}
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X size={28} />
        </button>
      </div>

      {hasPrev && (
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all border border-white/10">
          <ChevronLeft size={32} />
        </button>
      )}
      {hasNext && (
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-all border border-white/10">
          <ChevronRight size={32} />
        </button>
      )}
      
      <div className="flex-1 flex items-center justify-center w-full min-h-0 relative overflow-hidden">
        {item.type === "video" ? (
          <iframe
            src={item.url.replace("watch?v=", "embed/")}
            className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl"
            allowFullScreen
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <motion.img 
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={optimizeCloudinaryUrl(item.url)} 
            alt={item.caption || ""} 
            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl overflow-visible" 
            onClick={(e) => e.stopPropagation()} 
          />
        )}
      </div>

      <div className="w-full md:w-80 lg:w-96 flex flex-col shrink-0 max-h-[90vh] md:max-h-[85vh] bg-black/40 md:bg-transparent p-4 md:p-0 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="overflow-y-auto pr-2 scrollbar-hide">
          {item.caption && <p className="text-white/90 text-sm mb-4 leading-relaxed font-light">{item.caption}</p>}
          {item.eventName && <p className="text-amber-gold text-xs font-bold uppercase tracking-widest mb-1">{item.eventName}</p>}
          <div className="w-12 h-0.5 bg-amber-gold/30 mb-6" />
        </div>
        <Interactions targetId={item._id} />
      </div>
    </motion.div>
  );
}
