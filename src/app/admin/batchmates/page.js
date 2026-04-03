"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Upload } from "lucide-react";

export default function AdminBatchmates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [batchmates, setBatchmates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", quote: "", bio: "", superlativeTitle: "", linkedin: "", instagram: "", rollNo: "" });

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);
  useEffect(() => { loadData(); }, []);

  const loadData = () => { fetch("/api/batchmates").then((r) => r.json()).then(setBatchmates).catch(() => {}); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "vesit-aids/profiles");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setForm({ ...form, photo: { url: data.url, publicId: data.publicId } });
    } catch {}
    setUploading(false);
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, _id: editing } : form;
    await fetch("/api/batchmates", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setForm({ name: "", quote: "", bio: "", superlativeTitle: "", linkedin: "", instagram: "", rollNo: "" });
    setEditing(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this profile?")) return;
    await fetch(`/api/batchmates?id=${id}`, { method: "DELETE" });
    loadData();
  };

  const startEdit = (b) => {
    setEditing(b._id);
    setForm({ name: b.name, quote: b.quote, bio: b.bio, superlativeTitle: b.superlativeTitle, linkedin: b.linkedin, instagram: b.instagram, rollNo: b.rollNo, photo: b.photo });
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Manage Batchmates</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-warm-sand/20 rounded-2xl p-6 border border-warm-sand/50 mb-8">
          <h2 className="font-serif text-lg text-deep-navy mb-4">{editing ? "Edit Profile" : "Add Batchmate"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="Roll No" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="Fun quote" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="Superlative title (e.g. Class Clown)" value={form.superlativeTitle} onChange={(e) => setForm({ ...form, superlativeTitle: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input placeholder="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
          </div>
          <textarea placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2}
            className="w-full mt-4 px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30 resize-none" />
          
          {/* Photo upload */}
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-warm-sand/50 rounded-xl text-sm text-deep-navy cursor-pointer hover:bg-warm-sand transition-colors">
              <Upload size={14} /> {uploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {form.photo?.url && <img src={form.photo.url} alt="" className="w-12 h-12 rounded-full object-cover border border-warm-sand" />}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-deep-navy text-parchment rounded-xl text-sm hover:bg-archive-navy transition-colors">
              <Save size={14} /> {editing ? "Update" : "Add"}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ name: "", quote: "", bio: "", superlativeTitle: "", linkedin: "", instagram: "", rollNo: "" }); }}
                className="flex items-center gap-2 px-5 py-2 bg-warm-sand/50 text-deep-navy rounded-xl text-sm"><X size={14} /> Cancel</button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {batchmates.map((b) => (
            <div key={b._id} className="bg-white/50 rounded-xl p-4 border border-warm-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warm-sand/50 overflow-hidden flex-shrink-0">
                  {b.photo?.url ? <img src={b.photo.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm text-deep-navy/30">{b.name?.[0]}</div>}
                </div>
                <div>
                  <h3 className="font-medium text-deep-navy text-sm">{b.name}</h3>
                  <p className="text-xs text-deep-navy/40">{b.rollNo} {b.superlativeTitle && `· ${b.superlativeTitle}`}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(b)} className="p-1.5 text-archive-navy/50 hover:text-archive-navy"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(b._id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
