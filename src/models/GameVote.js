import mongoose from "mongoose";

const GameVoteSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "GameQuestion", required: true },
    batchmateId: { type: mongoose.Schema.Types.ObjectId, ref: "Batchmate", required: true },
    voterToken: { type: String, required: true }, // localStorage fingerprint
    voterIP: { type: String, default: "" },        // IP-based dedup
  },
  { timestamps: true }
);

// One vote per voter per question (by token)
GameVoteSchema.index({ questionId: 1, voterToken: 1 }, { unique: true });
// Fast aggregation of vote counts
GameVoteSchema.index({ questionId: 1, batchmateId: 1 });

export default mongoose.models.GameVote ||
  mongoose.model("GameVote", GameVoteSchema);
