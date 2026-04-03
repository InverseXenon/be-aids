"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar, Users, Image, MessageSquare, Trophy, FolderOpen, LogOut, Shield,
} from "lucide-react";

const sections = [
  { href: "/admin/timeline", label: "Timeline Events", icon: Calendar, color: "bg-year1", desc: "Add, edit & delete events" },
  { href: "/admin/batchmates", label: "Batchmates", icon: Users, color: "bg-year2", desc: "Manage student profiles" },
  { href: "/admin/gallery", label: "Media Vault", icon: Image, color: "bg-sticky-mint", desc: "Upload photos & videos" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, color: "bg-sticky-lemon", desc: "Moderate sticky notes" },
  { href: "/admin/hall-of-fame", label: "Hall of Fame", icon: Trophy, color: "bg-sticky-peach", desc: "Manage voting categories" },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <p className="text-deep-navy/40 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-parchment">
      {/* Admin header */}
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-amber-gold" />
            <span className="font-serif text-lg">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-parchment/60 hover:text-parchment transition-colors">
              View Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-sm text-parchment/60 hover:text-parchment transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl text-deep-navy mb-8"
        >
          Welcome, Admin 👋
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s, i) => (
            <motion.div
              key={s.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={s.href}
                className={`${s.color} rounded-2xl p-6 flex items-start gap-4 hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md border border-black/5 block`}
              >
                <s.icon className="text-deep-navy/60 mt-0.5" size={24} />
                <div>
                  <h3 className="font-serif text-base font-semibold text-deep-navy">{s.label}</h3>
                  <p className="text-xs text-deep-navy/50 mt-1">{s.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
