import mongoose from "mongoose";

const GameQuestionSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    prompt: { type: String, required: true }, // "Who is most likely to become a CEO?"
    status: {
      type: String,
      enum: ["pending", "open", "revealed"],
      default: "pending",
    },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Batchmate", default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GameQuestionSchema.index({ gameId: 1, order: 1 });

export default mongoose.models.GameQuestion ||
  mongoose.model("GameQuestion", GameQuestionSchema);
