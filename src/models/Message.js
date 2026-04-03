import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    content: { type: String, required: true },
    color: {
      type: String,
      enum: ["lemon", "petal", "mint", "lavender", "peach"],
      default: "lemon",
    },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
