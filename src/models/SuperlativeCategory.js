import mongoose from "mongoose";

const SuperlativeCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emoji: { type: String, default: "🏆" },
    isOpen: { type: Boolean, default: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Batchmate", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.SuperlativeCategory ||
  mongoose.model("SuperlativeCategory", SuperlativeCategorySchema);
