import mongoose from "mongoose";

const ArchiveItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
    year: { type: Number, enum: [1, 2, 3, 4] },
    category: {
      type: String,
      enum: ["Exams", "Results", "Notices", "Trips", "Hackathons", "Projects", "Other"],
      default: "Other",
    },
    description: { type: String, default: "" },
    fileType: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.ArchiveItem || mongoose.model("ArchiveItem", ArchiveItemSchema);
