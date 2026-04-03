"use client";
import { useState } from "react";
import { Upload } from "lucide-react";

export default function CloudinaryUploadWidget({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "vesit-aids/timeline");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        onUploadSuccess(data.url, data.publicId);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
    setUploading(false);
  };

  return (
    <label className="inline-flex items-center gap-2 px-5 py-2 bg-warm-sand/50 text-deep-navy border border-warm-sand rounded-xl text-sm cursor-pointer hover:bg-warm-sand transition-colors">
      <Upload size={14} /> {uploading ? "Uploading..." : "Select File"}
      <input 
        type="file" 
        accept="image/*,video/*" 
        onChange={handleUpload} 
        className="hidden" 
        disabled={uploading} 
      />
    </label>
  );
}
