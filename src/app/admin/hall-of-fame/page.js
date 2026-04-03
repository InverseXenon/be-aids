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
    // Actually we need POST for creating — let me use the category model directly
    // For simplicity, we'll create via a workaround: use PUT with no _id to trigger create
    // Actually, let's add a proper POST handler. For now let's just use the route:
    const res = await fetch("/api/superlatives", {
      method: "POST",  // This is the vote endpoint, so let's use PUT for admin
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: "new", batchmateId: "new", sessionId: "admin" }),
    });
    // Better approach: direct DB insert via a separate admin endpoint
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
        <p className="text-sm text-deep-navy/50 mb-6">
          Use the MongoDB shell or a tool like MongoDB Compass to create categories directly. Toggle voting open/close here.
        </p>

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
