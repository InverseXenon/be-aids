"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Trash2 } from "lucide-react";

const stickyColors = {
  lemon: "bg-sticky-lemon",
  petal: "bg-sticky-petal",
  mint: "bg-sticky-mint",
  lavender: "bg-sticky-lavender",
  peach: "bg-sticky-peach",
};

export default function AdminMessages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [tab, setTab] = useState("pending");

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);
  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    fetch("/api/messages?pending=true").then((r) => r.json()).then(setPending).catch(() => {});
    fetch("/api/messages").then((r) => r.json()).then(setApproved).catch(() => {});
  };

  const handleApprove = async (id) => {
    await fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, approved: true }),
    });
    loadData();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
    loadData();
  };

  if (status !== "authenticated") return null;

  const messages = tab === "pending" ? pending : approved;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Moderate Messages</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("pending")}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${tab === "pending" ? "bg-amber-gold text-white" : "bg-warm-sand/50 text-deep-navy/60"}`}>
            Pending ({pending.length})
          </button>
          <button onClick={() => setTab("approved")}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${tab === "approved" ? "bg-amber-gold text-white" : "bg-warm-sand/50 text-deep-navy/60"}`}>
            Approved ({approved.length})
          </button>
        </div>

        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg._id} className={`${stickyColors[msg.color] || "bg-sticky-lemon"} rounded-xl p-4 flex items-start justify-between`}>
              <div>
                <p className="font-handwriting text-base text-deep-navy/80">&ldquo;{msg.content}&rdquo;</p>
                <p className="text-xs text-deep-navy/40 mt-1">— {msg.author} · {new Date(msg.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-3">
                {tab === "pending" && (
                  <button onClick={() => handleApprove(msg._id)} className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600">
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(msg._id)} className="p-1.5 bg-red-400 text-white rounded-full hover:bg-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-center text-deep-navy/40 py-8">No messages here.</p>}
        </div>
      </main>
    </div>
  );
}
