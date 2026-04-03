import mongoose from "mongoose";

const BatchmateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photo: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    quote: { type: String, default: "" },
    bio: { type: String, default: "" },
    superlativeTitle: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    specialization: { type: String, default: "AI & Data Science" },
    rollNo: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Batchmate || mongoose.model("Batchmate", BatchmateSchema);
