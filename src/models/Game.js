import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["waiting", "live", "revealed", "ended"],
      default: "waiting",
    },
    currentQuestionIndex: { type: Number, default: -1 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "GameQuestion" }],
    // Monotonically increasing version — clients use this to detect stale state
    stateVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Game || mongoose.model("Game", GameSchema);
