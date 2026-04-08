import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameQuestion from "@/models/GameQuestion";
import GameVote from "@/models/GameVote";
import Batchmate from "@/models/Batchmate";

// POST — Admin game control actions
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const { action, questionId, prompt } = await request.json();

  const game = await Game.findOne({ status: { $ne: "ended" } }).sort({ createdAt: -1 });
  if (!game) {
    return NextResponse.json({ error: "No active game" }, { status: 404 });
  }

  const questions = await GameQuestion.find({ gameId: game._id }).sort({ order: 1 });

  switch (action) {
    // ─── ADD QUESTION ───
    case "add-question": {
      if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });
      const q = await GameQuestion.create({
        gameId: game._id,
        prompt,
        order: questions.length,
        status: "pending",
      });
      game.questions.push(q._id);
      game.stateVersion += 1;
      await game.save();
      return NextResponse.json(q, { status: 201 });
    }

    // ─── REMOVE QUESTION ───
    case "remove-question": {
      if (!questionId) return NextResponse.json({ error: "questionId required" }, { status: 400 });
      const q = await GameQuestion.findById(questionId);
      if (!q || q.status !== "pending") {
        return NextResponse.json({ error: "Cannot remove non-pending question" }, { status: 400 });
      }
      await GameVote.deleteMany({ questionId: q._id });
      await GameQuestion.findByIdAndDelete(questionId);
      game.questions = game.questions.filter((id) => id.toString() !== questionId);
      game.stateVersion += 1;
      await game.save();
      // Re-order remaining questions
      const remaining = await GameQuestion.find({ gameId: game._id }).sort({ order: 1 });
      for (let i = 0; i < remaining.length; i++) {
        remaining[i].order = i;
        await remaining[i].save();
      }
      return NextResponse.json({ success: true });
    }

    // ─── OPEN VOTING (launch next question) ───
    case "open-voting": {
      const nextIndex = game.currentQuestionIndex + 1;
      if (nextIndex >= questions.length) {
        return NextResponse.json({ error: "No more questions" }, { status: 400 });
      }
      // Close current question if open
      if (game.currentQuestionIndex >= 0 && questions[game.currentQuestionIndex]) {
        const curr = questions[game.currentQuestionIndex];
        if (curr.status === "open") {
          curr.status = "revealed";
          await curr.save();
        }
      }
      // Open next question
      const nextQ = questions[nextIndex];
      nextQ.status = "open";
      await nextQ.save();
      game.currentQuestionIndex = nextIndex;
      game.status = "live";
      game.stateVersion += 1;
      await game.save();
      return NextResponse.json({
        success: true,
        question: { _id: nextQ._id, prompt: nextQ.prompt, status: nextQ.status },
      });
    }

    // ─── REVEAL RESULT ───
    case "reveal-result": {
      if (game.currentQuestionIndex < 0 || game.currentQuestionIndex >= questions.length) {
        return NextResponse.json({ error: "No active question" }, { status: 400 });
      }
      const currentQ = questions[game.currentQuestionIndex];
      if (currentQ.status !== "open") {
        return NextResponse.json({ error: "Question not open" }, { status: 400 });
      }

      // Compute winner — batchmate with most votes
      const votes = await GameVote.aggregate([
        { $match: { questionId: currentQ._id } },
        { $group: { _id: "$batchmateId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const totalVotes = votes.reduce((sum, v) => sum + v.count, 0);
      const winnerId = votes.length > 0 ? votes[0]._id : null;

      currentQ.status = "revealed";
      currentQ.winnerId = winnerId;
      await currentQ.save();

      game.status = "revealed";
      game.stateVersion += 1;
      await game.save();

      // Build response with top 5 results
      const top5 = votes.slice(0, 5);
      const enriched = await Promise.all(
        top5.map(async (v) => {
          const b = await Batchmate.findById(v._id).select("name photo rollNo").lean();
          return {
            batchmate: b,
            count: v.count,
            percentage: totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0,
          };
        })
      );

      const winner = winnerId
        ? await Batchmate.findById(winnerId).select("name photo rollNo").lean()
        : null;

      return NextResponse.json({
        success: true,
        winner,
        results: enriched,
        totalVotes,
      });
    }

    // ─── END GAME ───
    case "end-game": {
      game.status = "ended";
      game.stateVersion += 1;
      await game.save();
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

// GET — Admin: full game data with vote counts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const game = await Game.findOne({ status: { $ne: "ended" } })
    .sort({ createdAt: -1 })
    .lean();

  if (!game) {
    return NextResponse.json({ active: false });
  }

  const questions = await GameQuestion.find({ gameId: game._id })
    .sort({ order: 1 })
    .lean();

  // Get vote counts for current question
  let voteCounts = [];
  let totalVoters = 0;
  const currentQ =
    game.currentQuestionIndex >= 0 ? questions[game.currentQuestionIndex] : null;

  if (currentQ && (currentQ.status === "open" || currentQ.status === "revealed")) {
    const votes = await GameVote.aggregate([
      { $match: { questionId: currentQ._id } },
      { $group: { _id: "$batchmateId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    totalVoters = votes.reduce((sum, v) => sum + v.count, 0);
    voteCounts = await Promise.all(
      votes.map(async (v) => {
        const b = await Batchmate.findById(v._id).select("name photo").lean();
        return { batchmate: b, count: v.count };
      })
    );
  }

  return NextResponse.json({
    active: true,
    game: {
      _id: game._id,
      status: game.status,
      currentQuestionIndex: game.currentQuestionIndex,
      stateVersion: game.stateVersion,
    },
    questions: questions.map((q) => ({
      _id: q._id,
      prompt: q.prompt,
      status: q.status,
      order: q.order,
      winnerId: q.winnerId,
    })),
    currentQuestion: currentQ
      ? { _id: currentQ._id, prompt: currentQ.prompt, status: currentQ.status }
      : null,
    voteCounts,
    totalVoters,
  });
}
