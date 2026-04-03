import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    targetId: { type: String, required: true },
    sessionId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Like || mongoose.model("Like", LikeSchema);
