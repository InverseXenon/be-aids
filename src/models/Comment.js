import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    targetId: { type: String, required: true },
    authorName: { type: String, required: true, default: "Anonymous" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
