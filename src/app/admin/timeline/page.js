"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import CloudinaryUploadWidget from "@/components/shared/CloudinaryUploadWidget";

export default function AdminTimeline() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", description: "", category: "Other", year: 1, semester: 1, photos: [] });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    fetch("/api/events").then((r) => r.json()).then(setEvents).catch(() => {});
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, _id: editing } : form;
    await fetch("/api/events", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setForm({ title: "", date: "", description: "", category: "Other", year: 1, semester: 1, photos: [] });
    setEditing(null);
    loadEvents();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    loadEvents();
  };

  const startEdit = (e) => {
    setEditing(e._id);
    setForm({ title: e.title, date: e.date?.split("T")[0] || "", description: e.description, category: e.category, year: e.year, semester: e.semester || 1, photos: e.photos || [] });
  };

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-deep-navy text-parchment py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-parchment/60 hover:text-parchment"><ArrowLeft size={20} /></Link>
          <span className="font-serif text-lg">Manage Timeline Events</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Form */}
        <div className="bg-warm-sand/20 rounded-2xl p-6 border border-warm-sand/50 mb-8">
          <h2 className="font-serif text-lg text-deep-navy mb-4">{editing ? "Edit Event" : "Add New Event"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30">
              {["Academics", "Cultural", "Sports", "Trips", "Hackathons", "Farewell", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <select value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30">
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy focus:outline-none focus:ring-2 focus:ring-amber-gold/30">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full mt-4 px-4 py-2.5 rounded-xl border border-warm-sand bg-white/50 text-deep-navy placeholder:text-deep-navy/30 focus:outline-none focus:ring-2 focus:ring-amber-gold/30 resize-none" />
          
          <div className="mt-4">
            <label className="block text-xs font-medium text-deep-navy/60 mb-2">Attach Event Photos (Optional)</label>
            <CloudinaryUploadWidget 
              onUploadSuccess={(url, publicId) => {
                setForm({...form, photos: [...form.photos, { url, publicId }]});
              }}
            />
            {form.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {form.photos.map((p, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden group bg-black/10">
                    {(p.url.includes('/video/') || p.url.match(/\.(mp4|webm|ogg)$/i)) ? (
                      <video src={p.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => setForm({...form, photos: form.photos.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-deep-navy text-parchment rounded-xl text-sm hover:bg-archive-navy transition-colors">
              <Save size={14} /> {editing ? "Update" : "Add Event"}
            </button>
            {editing && (
              <button onClick={() => { setEditing(null); setForm({ title: "", date: "", description: "", category: "Other", year: 1, semester: 1, photos: [] }); }}
                className="flex items-center gap-2 px-5 py-2 bg-warm-sand/50 text-deep-navy rounded-xl text-sm hover:bg-warm-sand transition-colors">
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Event list */}
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e._id} className="bg-white/50 rounded-xl p-4 border border-warm-sand/50 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-deep-navy text-sm">{e.title}</h3>
                <p className="text-xs text-deep-navy/40 mt-0.5">
                  {new Date(e.date).toLocaleDateString()} · {e.category} · Year {e.year}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(e)} className="p-1.5 text-archive-navy/50 hover:text-archive-navy"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(e._id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
