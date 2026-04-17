import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameQuestion from "@/models/GameQuestion";
import GameVote from "@/models/GameVote";
import Batchmate from "@/models/Batchmate";

// GET — Fetch active game state (public, for participants)
export async function GET() {
  await dbConnect();

  const game = await Game.findOne({}).sort({ createdAt: -1 }).lean();

  if (!game) {
    return NextResponse.json({ active: false });
  }

  const isEnded = game.status === "ended";
  // Get questions in order
  const questions = await GameQuestion.find({ gameId: game._id })
    .sort({ order: 1 })
    .lean();

  const currentQuestion =
    game.currentQuestionIndex >= 0 && game.currentQuestionIndex < questions.length
      ? questions[game.currentQuestionIndex]
      : null;

  // If result is revealed, include winner info
  let winner = null;
  if (currentQuestion && currentQuestion.status === "revealed" && currentQuestion.winnerId) {
    winner = await Batchmate.findById(currentQuestion.winnerId)
      .select("name photo rollNo")
      .lean();
  }

  // Get vote counts for revealed questions (for trophy wall at game end)
  let revealedResults = [];
  if (game.status === "ended") {
    const revealedQs = questions.filter((q) => q.status === "revealed");
    revealedResults = await Promise.all(
      revealedQs.map(async (q) => {
        const w = q.winnerId
          ? await Batchmate.findById(q.winnerId).select("name photo rollNo").lean()
          : null;
        const totalVotes = await GameVote.countDocuments({ questionId: q._id });
        const winnerVotes = q.winnerId
          ? await GameVote.countDocuments({ questionId: q._id, batchmateId: q.winnerId })
          : 0;
        return {
          _id: q._id,
          prompt: q.prompt,
          winner: w,
          totalVotes,
          winnerVotes,
          percentage: totalVotes > 0 ? Math.round((winnerVotes / totalVotes) * 100) : 0,
        };
      })
    );
  }

  // For revealed state, include vote data for current question
  let currentVoteData = null;
  if (currentQuestion && currentQuestion.status === "revealed") {
    const rawVotes = await GameVote.aggregate([
      { $match: { questionId: currentQuestion._id } },
      { $group: { _id: "$batchmateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    rawVotes.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a._id.toString().localeCompare(b._id.toString());
    });
    const votes = rawVotes.slice(0, 5);
    const totalVotes = await GameVote.countDocuments({ questionId: currentQuestion._id });
    const enriched = await Promise.all(
      votes.map(async (v) => {
        const b = await Batchmate.findById(v._id).select("name photo").lean();
        return {
          batchmate: b,
          count: v.count,
          percentage: totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0,
        };
      })
    );
    currentVoteData = { results: enriched, totalVotes };
  }

  return NextResponse.json({
    active: !isEnded,
    gameStatus: game.status,
    game: {
      _id: game._id,
      status: game.status,
      currentQuestionIndex: game.currentQuestionIndex,
      totalQuestions: questions.length,
      stateVersion: game.stateVersion,
    },
    currentQuestion: !isEnded && currentQuestion
      ? {
          _id: currentQuestion._id,
          prompt: currentQuestion.prompt,
          status: currentQuestion.status,
        }
      : null,
    winner: !isEnded ? winner : null,
    currentVoteData: !isEnded ? currentVoteData : null,
    revealedResults,
  });
}

// POST — Create a new game (admin only)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // End any existing active games
  await Game.updateMany({ status: { $ne: "ended" } }, { status: "ended" });

  const { questions: prompts } = await request.json();

  const game = await Game.create({ status: "waiting", currentQuestionIndex: -1 });

  // Create questions
  if (prompts && prompts.length > 0) {
    const questionDocs = prompts.map((prompt, i) => ({
      gameId: game._id,
      prompt,
      order: i,
      status: "pending",
    }));
    const created = await GameQuestion.insertMany(questionDocs);
    game.questions = created.map((q) => q._id);
    await game.save();
  }

  return NextResponse.json(game, { status: 201 });
}

// DELETE — End/reset the game (admin only)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const game = await Game.findOne({ status: { $ne: "ended" } }).sort({ createdAt: -1 });
  if (game) {
    game.status = "ended";
    game.stateVersion += 1;
    await game.save();
  }

  return NextResponse.json({ success: true });
}
