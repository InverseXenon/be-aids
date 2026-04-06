"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Disc3, Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";

const TRACKS = [
  { title: "Yaariyan Reprise (ABCD) 💫", url: "/music/yaariyan.m4a" },
  { title: "Tera Yaar Hoon Main 🎸", url: "/music/terayaar.m4a" },
  { title: "See You Again 🕊️", url: "/music/seeyouagain.m4a" },
  { title: "Yeh Dosti Hum Nahi Todenge 🏍️", url: "/music/yehdosti.m4a" },
  { title: "Memories (Maroon 5) 🥂", url: "/music/memories.m4a" }
];

export default function LofiPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  // Progress bar update loop
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Attempt Autoplay on first render
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browsers will often block auto-play without prior interaction.
          setIsPlaying(false);
        });
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error("Audio block/403: ", e);
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % TRACKS.length;
    setCurrentTrack(next);
    setProgress(0);
    if (isPlaying) {
      setTimeout(() => {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }, 50);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrack].url} 
        onEnded={nextTrack}
        autoPlay
        loop={false}
      />
      
      <div className="fixed bottom-8 left-8 z-50 flex items-end">
        <motion.div 
          initial={false}
          animate={{ 
            width: isOpen ? 280 : 0,
            opacity: isOpen ? 1 : 0,
            marginLeft: isOpen ? 16 : 0
          }}
          className="bg-deep-navy/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[76px] origin-left overflow-x-hidden whitespace-nowrap"
        >
          {/* Mini progress bar at top */}
          <div className="w-full h-1 bg-warm-sand/10 shrink-0">
            <div 
              className="h-full bg-amber-gold/70 transition-[width] duration-200 ease-linear rounded-r-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-4 flex items-center justify-between w-full min-w-[280px] flex-1">
            <div className="flex flex-col">
              <span className="text-amber-gold text-[10px] uppercase tracking-wider font-bold">Now Playing</span>
              <span className="text-parchment text-sm font-medium pr-4 truncate w-32">{TRACKS[currentTrack].title}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-2 bg-warm-sand/20 rounded-full text-parchment hover:bg-warm-sand/40 transition-colors">
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <button onClick={nextTrack} className="p-1.5 text-parchment/60 hover:text-parchment transition-colors">
                <SkipForward size={14} />
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 text-parchment/60 hover:text-parchment transition-colors ml-1 border-l border-white/10 pl-3">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>
        </motion.div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`shrink-0 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-500 ease-out z-10 ${isPlaying ? 'bg-amber-gold text-deep-navy' : 'bg-archive-navy text-parchment'}`}
        >
          <div className="relative">
             <motion.div
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ repeat: isPlaying ? Infinity : 0, duration: 3, ease: "linear" }}
             >
               <Disc3 size={20} />
             </motion.div>
             {isPlaying && (
               <div className="absolute -top-1 -right-1 flex gap-0.5 items-end h-3">
                 <div className="w-0.5 bg-deep-navy animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                 <div className="w-0.5 bg-deep-navy animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                 <div className="w-0.5 bg-deep-navy animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
               </div>
             )}
          </div>
        </button>
      </div>
    </>
  );
}
