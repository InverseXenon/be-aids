"use client";
import { useEffect, useState, useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const HTMLFlipBook = dynamic(() => import("react-pageflip").then((mod) => mod.default), {
  ssr: false,
});

const Page = forwardRef(function PageInner({ children, className = "" }, ref) {
  return (
    <div
      ref={ref}
      className={`bg-parchment shadow-lg flex flex-col items-center justify-center p-8 ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' type='fractalNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </div>
  );
});

function CoverPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-deep-navy text-parchment p-8 rounded-r-lg">
      <p className="text-sm tracking-[0.3em] uppercase text-amber-gold/70 mb-4">VESIT · Mumbai</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Batch &apos;26</h1>
      <div className="w-16 h-0.5 bg-amber-gold/30 mb-6 mt-4" />
      <p className="font-handwriting text-xl text-parchment/60">Yearbook</p>
    </div>
  );
}

function BackCover() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-deep-navy text-parchment p-8 rounded-l-lg">
      <p className="font-handwriting text-2xl text-amber-gold mb-4">
        &ldquo;Four years. One family. Forever.&rdquo;
      </p>
      <div className="w-16 h-0.5 bg-amber-gold/30 mb-4" />
      <p className="text-sm text-parchment/40">Batch &apos;26 · VESIT</p>
    </div>
  );
}

export default function YearbookPage() {
  const [batchmates, setBatchmates] = useState([]);
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetch("/api/batchmates")
      .then((r) => r.json())
      .then(setBatchmates)
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">Digital Yearbook 📖</h1>
            <p className="text-deep-navy/50 max-w-lg mx-auto">
              Flip through the pages of our memories. Each page tells a story.
            </p>
          </motion.div>

          {/* Flipbook */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-3xl" style={{ minHeight: "500px" }}>
              {typeof window !== "undefined" && (
                <HTMLFlipBook
                  ref={bookRef}
                  width={400}
                  height={550}
                  size="stretch"
                  minWidth={280}
                  maxWidth={600}
                  minHeight={400}
                  maxHeight={700}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={(e) => setCurrentPage(e.data)}
                  onInit={(e) => setTotalPages(e.data?.pages?.length || 0)}
                  className="mx-auto"
                  style={{}}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={800}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={true}
                  maxShadowOpacity={0.3}
                  showPageCorners={true}
                  disableFlipByClick={false}
                >
                  {/* Cover */}
                  <Page><CoverPage /></Page>

                  {/* Class Photo page */}
                  <Page>
                    <h2 className="font-serif text-2xl text-deep-navy mb-6">Our Class 📸</h2>
                    <div className="grid grid-cols-6 gap-1">
                      {batchmates.slice(0, 48).map((b) => (
                        <div key={b._id} className="aspect-square bg-warm-sand/50 rounded overflow-hidden">
                          {b.photo?.url ? (
                            <img src={b.photo.url} alt={b.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-deep-navy/30">
                              {b.name?.[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-deep-navy/30 text-center">Batch of &apos;26</p>
                  </Page>

                  {/* Individual student pages */}
                  {batchmates.map((b) => (
                    <Page key={b._id}>
                      <div className="flex flex-col items-center text-center h-full justify-center">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-warm-sand/50 mb-4 border-2 border-amber-gold/30">
                          {b.photo?.url ? (
                            <img src={b.photo.url} alt={b.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-deep-navy/20">
                              {b.name?.[0]}
                            </div>
                          )}
                        </div>
                        <h3 className="font-serif text-xl font-semibold text-deep-navy mb-1">{b.name}</h3>
                        {b.superlativeTitle && (
                          <p className="text-xs text-amber-gold font-medium mb-2">🏆 {b.superlativeTitle}</p>
                        )}
                        {b.quote && (
                          <p className="font-handwriting text-base text-deep-navy/50 italic max-w-xs">
                            &ldquo;{b.quote}&rdquo;
                          </p>
                        )}
                        {b.bio && <p className="text-xs text-deep-navy/40 mt-3 max-w-xs">{b.bio}</p>}
                      </div>
                    </Page>
                  ))}

                  {/* Faculty shoutout */}
                  <Page>
                    <div className="text-center">
                      <h2 className="font-serif text-2xl text-deep-navy mb-4">Faculty Shoutouts 🎓</h2>
                      <p className="font-handwriting text-lg text-deep-navy/50 mb-4">
                        To the teachers who shaped our minds and tolerated our chaos.
                      </p>
                      <p className="text-sm text-deep-navy/30 italic">
                        Thank you for everything, VESIT AIDS faculty!
                      </p>
                    </div>
                  </Page>

                  {/* Back Cover */}
                  <Page><BackCover /></Page>
                </HTMLFlipBook>
              )}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
              className="p-2 rounded-full bg-warm-sand/50 text-deep-navy hover:bg-warm-sand transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-deep-navy/40">
              Page {currentPage + 1}
            </span>
            <button
              onClick={() => bookRef.current?.pageFlip()?.flipNext()}
              className="p-2 rounded-full bg-warm-sand/50 text-deep-navy hover:bg-warm-sand transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Download placeholder */}
          <div className="text-center mt-8">
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-deep-navy text-parchment rounded-xl hover:bg-archive-navy transition-colors font-medium text-sm opacity-60 cursor-not-allowed"
              title="PDF download coming soon"
            >
              <Download size={16} />
              Download PDF (Coming Soon)
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
