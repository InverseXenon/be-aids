"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2, Image } from "lucide-react";

export default function AdminGallery() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState("approved"); // 'approved' or 'pending'
  const [form, setForm] = useState({ type: "photo", year: 1, eventName: "", caption: "", tags: "" });

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);
  useEffect(() => { loadData(); }, []);

  const loadData = () => { fetch("/api/gallery").then((r) => r.json()).then(setMedia).catch(() => {}); };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    
    try {
      await Promise.all(files.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "vesit-aids/gallery");
        
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        
        await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: data.url,
            publicId: data.publicId,
            type: form.type,
            year: form.year,
            eventName: form.eventName,
            caption: form.caption,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            approved: true // Admins bypass approval
          }),
        });
      }));
      loadData();
      setForm({ ...form, eventName: "", caption: "", tags: "" });
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleAddVideo = async () => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;
    await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        type: "video",
        year: form.year,
        eventName: form.eventName,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        approved: true // Admins bypass approval
      }),
    });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this media?")) return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    loadData();
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Manage Media Vault</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-warm-sand/20 rounded-2xl p-6 border border-warm-sand/50 mb-8">
          <h2 className="font-serif text-lg text-deep-navy mb-4">Upload Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <select value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30">
              {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <input placeholder="Event name" value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-parchment/80 dark:bg-warm-sand/30 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-5 py-2 bg-deep-navy text-parchment rounded-xl text-sm cursor-pointer hover:bg-archive-navy transition-colors">
              <Upload size={14} /> {uploading ? "Uploading..." : "Upload Media"}
              <input type="file" accept="image/*,video/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            <button onClick={handleAddVideo} className="flex items-center gap-2 px-5 py-2 bg-archive-navy text-parchment rounded-xl text-sm hover:bg-deep-navy transition-colors">
              Add YouTube Video
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6 border-b border-warm-sand/30">
          <button 
            onClick={() => setView("approved")}
            className={`pb-2 text-sm font-medium transition-colors ${view === "approved" ? "text-deep-navy border-b-2 border-deep-navy" : "text-deep-navy/40 hover:text-deep-navy/70"}`}
          >
            Approved Gallery
          </button>
          <button 
            onClick={() => setView("pending")}
            className={`pb-2 text-sm font-medium transition-colors ${view === "pending" ? "text-deep-navy border-b-2 border-deep-navy" : "text-deep-navy/40 hover:text-deep-navy/70"}`}
          >
            Pending Approvals ({media.filter(m => !m.approved).length})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.filter(m => view === "approved" ? m.approved : !m.approved).map((m) => (
            <div key={m._id} className="relative group rounded-xl overflow-hidden border border-warm-sand/50">
              {m.type === "video" || m.url.includes("video") || m.url.match(/\.(mp4|webm|ogg)$/i) ? (
                <div className="aspect-video bg-deep-navy/10 flex items-center justify-center text-xs text-deep-navy/30">🎬 Video / {m.eventName}</div>
              ) : (
                <div className="w-full aspect-square relative bg-deep-navy/5 flex items-center justify-center">
                  <img src={m.url} alt="" className={`w-full h-full object-cover`} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!m.approved && (
                  <button onClick={async () => {
                    await fetch("/api/gallery", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _id: m._id, approved: true }) });
                    loadData();
                  }} className="p-1.5 bg-green-500 text-white rounded-full">
                    ✅
                  </button>
                )}
                <button onClick={() => handleDelete(m._id)}
                  className="p-1.5 bg-red-500 text-white rounded-full">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="p-2 bg-parchment/80 dark:bg-warm-sand/30">
                <p className="text-xs text-deep-navy truncate">{m.eventName || "Untitled"}</p>
                <p className="text-[10px] text-deep-navy/40">Year {m.year}</p>
              </div>
            </div>
          ))}
          {media.filter(m => view === "approved" ? m.approved : !m.approved).length === 0 && (
            <p className="col-span-full py-8 text-center text-deep-navy/40 text-sm italic">No {view} media found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
