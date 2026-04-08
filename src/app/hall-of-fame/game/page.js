"use client";
import { useEffect, useState, useCallback } from "react";
import { useGameStream, getVoterToken, hasVotedForQuestion, markVoted } from "@/lib/game-client";
import WaitingScreen from "@/components/game/WaitingScreen";
import VotingGrid from "@/components/game/VotingGrid";
import VoteSubmitted from "@/components/game/VoteSubmitted";
import ResultReveal from "@/components/game/ResultReveal";
import TrophyWall from "@/components/game/TrophyWall";

export default function GameParticipantPage() {
  const { gameState, connected } = useGameStream(false);
  const [batchmates, setBatchmates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loadingBatchmates, setLoadingBatchmates] = useState(true);

  // Fetch batchmates list once
  useEffect(() => {
    fetch("/api/batchmates")
      .then((r) => r.json())
      .then((data) => {
        setBatchmates(data);
        setLoadingBatchmates(false);
      })
      .catch(() => setLoadingBatchmates(false));
  }, []);

  // Check if already voted for current question
  useEffect(() => {
    if (gameState?.question?._id) {
      const alreadyVoted = hasVotedForQuestion(gameState.question._id);
      setVoted(alreadyVoted);

      // Also verify with server
      if (!alreadyVoted) {
        const token = getVoterToken();
        fetch(`/api/game/vote?questionId=${gameState.question._id}&voterToken=${token}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.hasVoted) {
              markVoted(gameState.question._id);
              setVoted(true);
            }
          })
          .catch(() => {});
      }
    } else {
      setVoted(false);
    }
  }, [gameState?.question?._id]);

  // Handle vote submission
  const handleVote = useCallback(
    async (batchmateId) => {
      if (!gameState?.question?._id) return;
      const voterToken = getVoterToken();

      try {
        const res = await fetch("/api/game/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: gameState.question._id,
            batchmateId,
            voterToken,
          }),
        });

        const data = await res.json();
        if (res.ok || data.alreadyVoted) {
          markVoted(gameState.question._id);
          setVoted(true);
        }
      } catch {
        // Network error — allow retry
      }
    },
    [gameState?.question?._id]
  );

  // ─── RENDER BASED ON GAME STATE ───

  // No active game
  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-6">
        <div className="text-5xl mb-6">🎮</div>
        <h1 className="font-serif text-2xl text-white mb-2 text-center">
          No Game Active
        </h1>
        <p className="text-white/40 text-center text-sm max-w-sm">
          The game hasn&apos;t started yet. Check back when the admin launches it!
        </p>
        {!connected && (
          <p className="text-amber-400/50 text-xs mt-6 animate-pulse">
            Reconnecting...
          </p>
        )}
      </div>
    );
  }

  // GAME ENDED — Trophy wall
  if (gameState.gameStatus === "ended") {
    return <TrophyWall results={gameState.revealedResults || []} />;
  }

  // WAITING — Game created but no question yet
  if (gameState.gameStatus === "waiting" || !gameState.question) {
    return <WaitingScreen />;
  }

  // REVEALED — Show cinematic result
  if (
    gameState.gameStatus === "revealed" ||
    gameState.question?.status === "revealed"
  ) {
    return (
      <ResultReveal
        winner={gameState.winner}
        question={gameState.question}
        voteResults={gameState.voteResults}
        totalVotes={gameState.totalVotes}
      />
    );
  }

  // LIVE — Voting is open
  if (gameState.gameStatus === "live" && gameState.question?.status === "open") {
    // Already voted
    if (voted) {
      return <VoteSubmitted />;
    }

    // Show voting grid
    return (
      <VotingGrid
        question={gameState.question}
        batchmates={batchmates}
        onVote={handleVote}
        disabled={loadingBatchmates}
      />
    );
  }

  // Fallback — waiting
  return <WaitingScreen />;
}
