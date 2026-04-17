"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStream } from "@/lib/game-client";
import AdminLiveVotes from "@/components/game/AdminLiveVotes";
import {
  Play, Eye, SkipForward, StopCircle, Plus, Trash2, Shield,
  Users, Radio, ArrowLeft, Copy, QrCode, RefreshCw,
} from "lucide-react";

const DEFAULT_QUESTIONS = [
  "Who slept the most in lectures? 😴",
  "Who had the most fake attendance? 🤡",
  "Sabse zyada proxy kaun lagata tha? 👀",
  "Who survived engineering purely on last-night jugaad? 🌙",
  "Who will still say 'bhai padhai nahi hui' after getting a 9 pointer? 📚",
  "Who is most likely to come to the reunion just for free food? 🍕",
  "Who had a different excuse for every missed submission? 🧢",
  "Who will get caught watching reels during a meeting at their job? 📱",
  "Who is most likely to reply 'noted' to everything at work? 💀",
  "Who will still be using 'bhai ye waala question aayega kya?' in life? 😂",
];

export default function AdminGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { gameState, connected } = useGameStream(true);

  const [questions, setQuestions] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [gameActive, setGameActive] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  // Fetch admin game data
  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("/api/game/admin");
      const data = await res.json();
      setAdminData(data);
      setGameActive(data.active);
      if (data.active && data.questions) {
        setQuestions(data.questions);
      }
    } catch {}
  }, []);

  // Poll admin data for vote counts
  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 2000);
    return () => clearInterval(interval);
  }, [fetchAdminData]);

  // Create a new game
  const createGame = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: DEFAULT_QUESTIONS }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch {}
    setLoading(false);
  };

  // Admin action
  const doAction = async (action, extra = {}) => {
    setActionLoading(action);
    try {
      const res = await fetch("/api/game/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (res.ok) {
        await fetchAdminData();
      }
    } catch {}
    setActionLoading("");
  };

  // Add question
  const addQuestion = async () => {
    if (!newPrompt.trim()) return;
    await doAction("add-question", { prompt: newPrompt.trim() });
    setNewPrompt("");
  };

  // Remove question
  const removeQuestion = async (questionId) => {
    await doAction("remove-question", { questionId });
  };

  // Copy game link
  const copyLink = () => {
    const url = `${window.location.origin}/hall-of-fame/game`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-zinc-600">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const currentQ = adminData?.currentQuestion;
  const gameStatus = adminData?.game?.status || gameState?.gameStatus;
  const currentIndex = adminData?.game?.currentQuestionIndex ?? -1;
  const totalQs = questions.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <Shield size={18} className="text-amber-400" />
            <span className="font-serif text-lg">Game Control</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-emerald-400" : "text-red-400"}`}>
              <Radio size={12} />
              {connected ? "Connected" : "Reconnecting..."}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ─── NO ACTIVE GAME ─── */}
        {!gameActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">🎮</div>
            <h2 className="font-serif text-2xl mb-3">Start a New Game</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">
              Create a &quot;Who Is Most Likely To...?&quot; game with pre-loaded questions.
              You can add or remove questions before starting.
            </p>
            <button
              onClick={createGame}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Game 🎯"}
            </button>
          </motion.div>
        )}

        {/* ─── ACTIVE GAME ─── */}
        {gameActive && (
          <>
            {/* Share Link */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">🔗 Share with participants</h3>
                  <p className="text-xs text-zinc-600 break-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/hall-of-fame/game` : "/hall-of-fame/game"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                  >
                    <Copy size={14} />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            </div>

            {/* Game Status Bar */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    gameStatus === "live" ? "bg-emerald-400 animate-pulse" :
                    gameStatus === "revealed" ? "bg-amber-400" :
                    gameStatus === "waiting" ? "bg-blue-400 animate-pulse" :
                    "bg-zinc-600"
                  }`} />
                  <div>
                    <p className="text-sm font-medium capitalize">{gameStatus || "waiting"}</p>
                    <p className="text-xs text-zinc-600">
                      Question {currentIndex + 1} of {totalQs}
                    </p>
                  </div>
                </div>
                {adminData?.totalVoters !== undefined && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users size={14} />
                    <span className="text-sm">{adminData.totalVoters} votes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Question */}
            {currentQ && (
              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-2">
                  Current Question
                </p>
                <h3 className="font-serif text-xl text-white mb-4">{currentQ.prompt}</h3>

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentQ.status === "open" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" :
                    currentQ.status === "revealed" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                    "bg-zinc-800 text-zinc-500"
                  }`}>
                    {currentQ.status === "open" ? "🟢 Voting Open" :
                     currentQ.status === "revealed" ? "🏆 Result Revealed" :
                     "Pending"}
                  </span>
                </div>

                {/* Live vote counts (admin only) */}
                {currentQ.status === "open" && (
                  <AdminLiveVotes
                    voteCounts={adminData?.voteCounts || []}
                    totalVoters={adminData?.totalVoters || 0}
                  />
                )}
              </div>
            )}

            {/* ─── CONTROL BUTTONS ─── */}
            <div className="flex flex-wrap gap-3">
              {/* Open Voting (show when waiting or after reveal) */}
              {(gameStatus === "waiting" || gameStatus === "revealed") && currentIndex + 1 < totalQs && (
                <button
                  onClick={() => doAction("open-voting")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg"
                >
                  <Play size={18} />
                  {actionLoading === "open-voting" ? "Opening..." :
                   gameStatus === "waiting" ? "Start First Question" : "Next Question"}
                </button>
              )}

              {/* Reveal Result (show when live/open) */}
              {gameStatus === "live" && currentQ?.status === "open" && (
                <button
                  onClick={() => doAction("reveal-result")}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg"
                >
                  <Eye size={18} />
                  {actionLoading === "reveal-result" ? "Revealing..." : "Reveal Result 🏆"}
                </button>
              )}

              {/* End Game */}
              {gameStatus !== "ended" && (
                <button
                  onClick={() => {
                    if (confirm("End the game? This cannot be undone.")) {
                      doAction("end-game");
                    }
                  }}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  <StopCircle size={18} />
                  End Game
                </button>
              )}

              {/* Reset — only when ended */}
              {gameStatus === "ended" && (
                <button
                  onClick={async () => {
                    await fetch("/api/game", { method: "DELETE" });
                    await fetchAdminData();
                    setGameActive(false);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all"
                >
                  <RefreshCw size={18} />
                  New Game
                </button>
              )}
            </div>

            {/* ─── QUESTION LIST ─── */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">
                📋 Question Queue ({questions.length})
              </h3>

              <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                {questions.map((q, i) => (
                  <div
                    key={q._id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      i === currentIndex
                        ? "bg-amber-400/10 border border-amber-400/20"
                        : q.status === "revealed"
                        ? "bg-zinc-800/30 border border-zinc-800"
                        : "bg-zinc-900/30 border border-zinc-800/50"
                    }`}
                  >
                    <span className={`text-xs w-6 text-center flex-shrink-0 ${
                      i === currentIndex ? "text-amber-400 font-bold" :
                      q.status === "revealed" ? "text-zinc-600" : "text-zinc-500"
                    }`}>
                      {i + 1}
                    </span>
                    <p className={`flex-1 text-sm ${
                      q.status === "revealed" ? "text-zinc-600 line-through" :
                      i === currentIndex ? "text-white" : "text-zinc-400"
                    }`}>
                      {q.prompt}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                      q.status === "open" ? "bg-emerald-400/10 text-emerald-400" :
                      q.status === "revealed" ? "bg-zinc-700 text-zinc-500" :
                      "bg-zinc-800 text-zinc-600"
                    }`}>
                      {q.status}
                    </span>
                    {q.status === "pending" && gameStatus === "waiting" && (
                      <button
                        onClick={() => removeQuestion(q._id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add question */}
              {gameStatus === "waiting" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a question..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                  <button
                    onClick={addQuestion}
                    disabled={!newPrompt.trim()}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
