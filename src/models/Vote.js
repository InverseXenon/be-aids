import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SuperlativeCategory", required: true },
    batchmateId: { type: mongoose.Schema.Types.ObjectId, ref: "Batchmate", required: true },
    sessionId: { type: String, required: true },
  },
  { timestamps: true }
);

VoteSchema.index({ categoryId: 1, sessionId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model("Vote", VoteSchema);
