import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
    photos: [{ url: String, publicId: String }],
    category: {
      type: String,
      enum: ["Academics", "Cultural", "Sports", "Trips", "Hackathons", "Farewell", "Other"],
      default: "Other",
    },
    year: { type: Number, enum: [1, 2, 3, 4], required: true },
    semester: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8] },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
