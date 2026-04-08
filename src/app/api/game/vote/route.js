import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameQuestion from "@/models/GameQuestion";
import GameVote from "@/models/GameVote";

// POST — Submit a vote
export async function POST(request) {
  await dbConnect();

  const { questionId, batchmateId, voterToken } = await request.json();

  if (!questionId || !batchmateId || !voterToken) {
    return NextResponse.json(
      { error: "questionId, batchmateId, and voterToken are required" },
      { status: 400 }
    );
  }

  // Verify question is open for voting
  const question = await GameQuestion.findById(questionId);
  if (!question || question.status !== "open") {
    return NextResponse.json({ error: "Voting is not open for this question" }, { status: 400 });
  }

  // Verify game is live
  const game = await Game.findById(question.gameId);
  if (!game || game.status !== "live") {
    return NextResponse.json({ error: "Game is not live" }, { status: 400 });
  }

  // Get voter IP for additional dedup
  const forwarded = request.headers.get("x-forwarded-for");
  const voterIP = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Check for duplicate vote by token
  const existingByToken = await GameVote.findOne({ questionId, voterToken });
  if (existingByToken) {
    return NextResponse.json({ error: "Already voted", alreadyVoted: true }, { status: 400 });
  }

  // Check for duplicate vote by IP (secondary check)
  // REMOVED: In a live party setting, many users will share the same Wi-Fi
  // and therefore share the same public IP. Deduplicating by IP breaks the core 
  // multiplayer experience. We rely strictly on LocalStorage voterTokens and the unique MongoDB index.
  // const existingByIP = await GameVote.findOne({ questionId, voterIP });
  // if (existingByIP && voterIP !== "unknown") {
  //   return NextResponse.json({ error: "Already voted from this device", alreadyVoted: true }, { status: 400 });
  // }

  try {
    const vote = await GameVote.create({
      questionId,
      batchmateId,
      voterToken,
      voterIP,
    });

    // Increment game state version to trigger SSE updates
    await Game.findByIdAndUpdate(game._id, { $inc: { stateVersion: 1 } });

    return NextResponse.json({ success: true, voteId: vote._id }, { status: 201 });
  } catch (err) {
    // Duplicate key error (race condition safety)
    if (err.code === 11000) {
      return NextResponse.json({ error: "Already voted", alreadyVoted: true }, { status: 400 });
    }
    throw err;
  }
}

// GET — Check if a voter has already voted for a question
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("questionId");
  const voterToken = searchParams.get("voterToken");

  if (!questionId || !voterToken) {
    return NextResponse.json({ error: "questionId and voterToken required" }, { status: 400 });
  }

  const existing = await GameVote.findOne({ questionId, voterToken });
  return NextResponse.json({ hasVoted: !!existing });
}
