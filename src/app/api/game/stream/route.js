import dbConnect from "@/lib/mongodb";
import Game from "@/models/Game";
import GameQuestion from "@/models/GameQuestion";
import GameVote from "@/models/GameVote";
import Batchmate from "@/models/Batchmate";

export const dynamic = "force-dynamic";

// SSE stream endpoint — all clients connect here for real-time updates
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get("admin") === "1";

  let lastVersion = -1;
  let aborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event, data) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          aborted = true;
        }
      };

      // Send initial keepalive
      send("connected", { time: Date.now() });

      const poll = async () => {
        if (aborted) return;

        try {
          const game = await Game.findOne({ status: { $ne: "ended" } })
            .sort({ createdAt: -1 })
            .lean();

          if (!game) {
            // Check if any game just ended
            const endedGame = await Game.findOne({})
              .sort({ updatedAt: -1 })
              .lean();

            if (endedGame && endedGame.status === "ended") {
              // If we already sent this exact ended state, just wait
              if (endedGame.stateVersion === lastVersion) {
                setTimeout(poll, 2000);
                return;
              }

              lastVersion = endedGame.stateVersion;

              // Build trophy wall data
              const questions = await GameQuestion.find({ gameId: endedGame._id })
                .sort({ order: 1 })
                .lean();
              const revealedResults = await Promise.all(
                questions
                  .filter((q) => q.status === "revealed")
                  .map(async (q) => {
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
              send("game-ended", { revealedResults });
            } else {
              send("no-game", {});
            }
            setTimeout(poll, 2000);
            return;
          }

          // Only send update if version changed
          if (game.stateVersion === lastVersion) {
            setTimeout(poll, 1000);
            return;
          }

          lastVersion = game.stateVersion;

          const questions = await GameQuestion.find({ gameId: game._id })
            .sort({ order: 1 })
            .lean();

          const currentQ =
            game.currentQuestionIndex >= 0 && game.currentQuestionIndex < questions.length
              ? questions[game.currentQuestionIndex]
              : null;

          // Base state update for all clients
          const state = {
            gameStatus: game.status,
            currentQuestionIndex: game.currentQuestionIndex,
            totalQuestions: questions.length,
            stateVersion: game.stateVersion,
          };

          if (currentQ) {
            state.question = {
              _id: currentQ._id,
              prompt: currentQ.prompt,
              status: currentQ.status,
            };
          }

          // If result is revealed, include winner + vote data for everyone
          if (currentQ && currentQ.status === "revealed") {
            if (currentQ.winnerId) {
              const winner = await Batchmate.findById(currentQ.winnerId)
                .select("name photo rollNo")
                .lean();
              state.winner = winner;
            }

            const votes = await GameVote.aggregate([
              { $match: { questionId: currentQ._id } },
              { $group: { _id: "$batchmateId", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ]);
            const totalVotes = await GameVote.countDocuments({ questionId: currentQ._id });
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
            state.voteResults = enriched;
            state.totalVotes = totalVotes;
          }

          // Admin gets live vote counts even during open voting
          if (isAdmin && currentQ && currentQ.status === "open") {
            const votes = await GameVote.aggregate([
              { $match: { questionId: currentQ._id } },
              { $group: { _id: "$batchmateId", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ]);
            const totalVoters = votes.reduce((sum, v) => sum + v.count, 0);
            const enriched = await Promise.all(
              votes.map(async (v) => {
                const b = await Batchmate.findById(v._id).select("name photo").lean();
                return { batchmate: b, count: v.count };
              })
            );
            state.voteCounts = enriched;
            state.totalVoters = totalVoters;
          }

          // Build trophy wall for ended game
          if (game.status === "ended") {
            const revealedResults = await Promise.all(
              questions
                .filter((q) => q.status === "revealed")
                .map(async (q) => {
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
            state.revealedResults = revealedResults;
          }

          send("state-update", state);
        } catch (err) {
          console.error("[SSE] Poll error:", err.message);
        }

        if (!aborted) {
          // Admin polls faster for live vote updates
          setTimeout(poll, isAdmin ? 1000 : 1500);
        }
      };

      // Start polling
      poll();

      // Send heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        if (aborted) {
          clearInterval(heartbeat);
          return;
        }
        send("heartbeat", { time: Date.now() });
      }, 30000);

      // Cleanup on abort
      request.signal.addEventListener("abort", () => {
        aborted = true;
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
