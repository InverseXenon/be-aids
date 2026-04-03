"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, Save } from "lucide-react";

export default function AdminHallOfFame() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: "", emoji: "🏆" });

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);
  useEffect(() => { loadData(); }, []);

  const loadData = () => { fetch("/api/superlatives?results=true").then((r) => r.json()).then(setCategories).catch(() => {}); };

  const handleAdd = async () => {
    if (!newCat.name) return;
    await fetch("/api/superlatives", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newCat, isOpen: true }),
    });
    loadData();
    setNewCat({ name: "", emoji: "🏆" });
  };

  const toggleOpen = async (cat) => {
    await fetch("/api/superlatives", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: cat._id, isOpen: !cat.isOpen }),
    });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category and all its votes?")) return;
    await fetch(`/api/superlatives?id=${id}`, { method: "DELETE" });
    loadData();
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Manage Hall of Fame</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-warm-sand/20 rounded-2xl p-6 border border-warm-sand/50 mb-8">
          <h2 className="font-serif text-lg text-deep-navy mb-4">Add New Category</h2>
          <div className="flex gap-4 items-center">
            <input 
              placeholder="Emoji (e.g. 🏆)" 
              value={newCat.emoji} 
              onChange={(e) => setNewCat({ ...newCat, emoji: e.target.value })}
              className="w-20 px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30 text-center" 
            />
            <input 
              placeholder="Category Name (e.g. Most Likely to...)" 
              value={newCat.name} 
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30" 
            />
            <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-3 bg-deep-navy text-parchment rounded-xl text-sm hover:bg-archive-navy transition-colors">
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white/50 rounded-xl p-4 border border-warm-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.emoji}</span>
                <div>
                  <h3 className="font-medium text-deep-navy text-sm">{cat.name}</h3>
                  <p className="text-xs text-deep-navy/40">{cat.totalVotes || 0} votes · {cat.isOpen ? "Open" : "Closed"}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => toggleOpen(cat)} className={`p-1.5 rounded ${cat.isOpen ? "text-green-500" : "text-deep-navy/30"}`}>
                  {cat.isOpen ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-center text-deep-navy/40 py-8">No voting categories yet.</p>}
        </div>
      </main>
    </div>
  );
}
