import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Like from "@/models/Like";
import Comment from "@/models/Comment";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("targetId");

  if (!targetId) {
    return NextResponse.json({ error: "targetId is required" }, { status: 400 });
  }

  try {
    const [likesCount, comments] = await Promise.all([
      Like.countDocuments({ targetId }),
      Comment.find({ targetId }).sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({ likesCount, comments });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch interactions" }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const { action, targetId, sessionId, text, authorName } = data;

  if (!targetId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    if (action === "like") {
      if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
      
      const existingLike = await Like.findOne({ targetId, sessionId });
      if (existingLike) {
        // Toggle like (unlike)
        await Like.findByIdAndDelete(existingLike._id);
        const newCount = await Like.countDocuments({ targetId });
        return NextResponse.json({ action: "unliked", likesCount: newCount }, { status: 200 });
      } else {
        await Like.create({ targetId, sessionId });
        const newCount = await Like.countDocuments({ targetId });
        return NextResponse.json({ action: "liked", likesCount: newCount }, { status: 201 });
      }
    } else if (action === "comment") {
      if (!text || !authorName) return NextResponse.json({ error: "text and authorName required" }, { status: 400 });
      
      const comment = await Comment.create({ targetId, text, authorName });
      return NextResponse.json(comment, { status: 201 });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
