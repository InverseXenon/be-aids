"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const stickyColors = {
  lemon: "bg-sticky-lemon",
  petal: "bg-sticky-petal",
  mint: "bg-sticky-mint",
  lavender: "bg-sticky-lavender",
  peach: "bg-sticky-peach",
};

function StickyNote({ message, index }) {
  const rotation = ((index * 7 + 3) % 7) - 3; // -3 to 3 degrees
  const color = stickyColors[message.color] || stickyColors.lemon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: rotation }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{
        scale: 1.05,
        rotate: 0,
        y: -8,
        transition: { duration: 0.2 },
      }}
      className={`${color} rounded-sm p-5 shadow-md hover:shadow-xl transition-shadow cursor-default border border-black/5`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <p className="font-handwriting text-lg text-deep-navy/80 leading-relaxed mb-3">
        &ldquo;{message.content}&rdquo;
      </p>
      <p className="text-xs text-deep-navy/40 font-medium">— {message.author}</p>
    </motion.div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ author: "", content: "", color: "lemon" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.author.trim() || !form.content.trim()) return;
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setForm({ author: "", content: "", color: "lemon" });
    } catch {}
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-deep-navy mb-3">Wall of Messages</h1>
            <p className="text-deep-navy/50 max-w-lg mx-auto">
              Pin your favorite memories, wishes, and inside jokes on our digital corkboard.
            </p>
          </motion.div>

          {/* Submit form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto mb-16 bg-warm-sand/30 rounded-2xl p-6 border border-warm-sand/50"
          >
            {submitted ? (
              <div className="text-center py-4">
                <p className="font-handwriting text-xl text-amber-gold">💌 Message submitted!</p>
                <p className="text-sm text-deep-navy/50 mt-2">It will appear after admin approval.</p>
                <button onClick={() => setSubmitted(false)} className="mt-3 text-sm text-archive-navy hover:underline">
                  Write another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30"
                  required
                />
                <textarea
                  placeholder="Write your message..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30 resize-none font-handwriting text-lg"
                  required
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-deep-navy/40">Note color:</span>
                  {Object.entries(stickyColors).map(([key, cls]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, color: key })}
                      className={`w-6 h-6 rounded-full ${cls} border-2 transition-transform ${form.color === key ? "border-deep-navy scale-110" : "border-transparent"}`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-deep-navy text-parchment py-2.5 rounded-xl hover:bg-archive-navy transition-colors font-medium"
                >
                  <Send size={16} />
                  Pin My Message
                </button>
              </form>
            )}
          </motion.div>

          {/* Corkboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {messages.map((msg, i) => (
              <StickyNote key={msg._id} message={msg} index={i} />
            ))}
          </div>

          {messages.length === 0 && (
            <p className="text-center text-deep-navy/40 py-20 font-handwriting text-xl">
              Be the first to leave a note! 📌
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
