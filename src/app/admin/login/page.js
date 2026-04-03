"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-warm-sand/30 rounded-2xl p-8 border border-warm-sand/50 shadow-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-deep-navy/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-deep-navy" size={24} />
          </div>
          <h1 className="font-serif text-2xl text-deep-navy">Admin Panel</h1>
          <p className="text-sm text-deep-navy/50 mt-1">Batch &apos;26</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30 text-center"
            required
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1 justify-center">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-deep-navy text-parchment rounded-xl hover:bg-archive-navy transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Checking..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
