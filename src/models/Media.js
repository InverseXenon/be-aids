import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    type: { type: String, enum: ["photo", "video"], default: "photo" },
    year: { type: Number, enum: [1, 2, 3, 4] },
    eventName: { type: String, default: "" },
    tags: [String],
    thumbnail: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
