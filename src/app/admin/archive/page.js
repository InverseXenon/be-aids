"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2, Save } from "lucide-react";

export default function AdminArchive() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", year: 1, category: "Other", description: "" });

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);
  useEffect(() => { loadData(); }, []);

  const loadData = () => { fetch("/api/archive").then((r) => r.json()).then(setItems).catch(() => {}); };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !form.title) { alert("Please enter a title first"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "vesit-aids/archive");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          fileUrl: data.url,
          publicId: data.publicId,
          year: form.year,
          category: form.category,
          description: form.description,
          fileType: data.format,
        }),
      });
      loadData();
      setForm({ title: "", year: 1, category: "Other", description: "" });
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/archive?id=${id}`, { method: "DELETE" });
    loadData();
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Manage Archive</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-warm-sand/20 rounded-2xl p-6 border border-warm-sand/50 mb-8">
          <h2 className="font-serif text-lg text-deep-navy mb-4">Upload Document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input placeholder="Document title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <select value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30">
              {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30">
              {["Exams", "Results", "Notices", "Trips", "Hackathons", "Projects", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-2 bg-deep-navy text-parchment rounded-xl text-sm cursor-pointer hover:bg-archive-navy transition-colors">
            <Upload size={14} /> {uploading ? "Uploading..." : "Upload File"}
            <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white/50 rounded-xl p-4 border border-warm-sand/50 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-deep-navy text-sm">{item.title}</h3>
                <p className="text-xs text-deep-navy/40">{item.category} · Year {item.year}</p>
              </div>
              <div className="flex gap-2">
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-archive-navy hover:underline">View</a>
                <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
