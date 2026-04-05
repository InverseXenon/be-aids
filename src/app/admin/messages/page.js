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
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState("approved"); // 'approved' or 'pending'

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);
  useEffect(() => { loadData(); }, [view]);

  const loadData = () => {
    fetch(`/api/messages?pending=${view === "pending"}`).then((r) => r.json()).then(setMessages).catch(() => {});
  };

  const handleApprove = async (id) => {
    await fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, approved: true }),
    });
    loadData();
  };

  const handleApproveAll = async () => {
    if(!confirm("Approve all pending messages?")) return;
    await fetch("/api/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    loadData();
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this message?")) return;
    await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
    loadData();
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Moderate Messages</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6 border-b border-warm-sand/30 items-end justify-between">
          <div className="flex gap-4 h-full">
            <button 
              onClick={() => setView("approved")}
              className={`pb-2 text-sm font-medium transition-colors ${view === "approved" ? "text-deep-navy border-b-2 border-deep-navy" : "text-deep-navy/40 hover:text-deep-navy/70"}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setView("pending")}
              className={`pb-2 text-sm font-medium transition-colors ${view === "pending" ? "text-deep-navy border-b-2 border-deep-navy" : "text-deep-navy/40 hover:text-deep-navy/70"}`}
            >
              Pending
            </button>
          </div>
          
          {view === "pending" && messages.length > 0 && (
            <button 
              onClick={handleApproveAll}
              className="mb-2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Approve All Pending
            </button>
          )}
        </div>

        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg._id} className={`${stickyColors[msg.color] || "bg-sticky-lemon"} rounded-xl p-4 flex items-start justify-between shadow-sm border border-black/5`}>
              <div>
                <p className="font-handwriting text-base text-deep-navy/80">&ldquo;{msg.content}&rdquo;</p>
                <p className="text-xs text-deep-navy/40 mt-1">— {msg.author} · {new Date(msg.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-3">
                {view === "pending" && (
                  <button onClick={() => handleApprove(msg._id)} className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(msg._id)} className="p-1.5 bg-red-400 text-white rounded-full hover:bg-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-deep-navy/40 py-12 text-sm italic">
              No {view} messages found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
