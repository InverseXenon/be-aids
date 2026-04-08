"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * React hook for connecting to the game SSE stream.
 * Handles auto-reconnect with exponential backoff.
 */
export function useGameStream(isAdmin = false) {
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/game/stream${isAdmin ? "?admin=1" : ""}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {
      setConnected(true);
      retryCountRef.current = 0; // Reset retry count on successful connection
    });

    es.addEventListener("state-update", (e) => {
      try {
        const data = JSON.parse(e.data);
        setGameState(data);
      } catch {}
    });

    es.addEventListener("game-ended", (e) => {
      try {
        const data = JSON.parse(e.data);
        setGameState((prev) => ({
          ...prev,
          gameStatus: "ended",
          revealedResults: data.revealedResults,
        }));
      } catch {}
    });

    es.addEventListener("no-game", () => {
      setGameState(null);
    });

    es.addEventListener("heartbeat", () => {
      // Connection is alive
    });

    es.onerror = () => {
      setConnected(false);
      es.close();

      // Exponential backoff: 1s, 2s, 4s, 8s, max 15s
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
      retryCountRef.current += 1;

      retryTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [isAdmin]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [connect]);

  return { gameState, connected };
}

/**
 * Get context suffix for test isolation
 */
function getStorageSuffix() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const testId = params.get("testId");
  return testId ? `-${testId}` : "";
}

/**
 * Get or create a persistent voter token for this browser.
 */
export function getVoterToken() {
  if (typeof window === "undefined") return "";
  const suffix = getStorageSuffix();
  const key = `game-voter-token${suffix}`;
  
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

/**
 * Check if the current user has voted for a specific question.
 */
export function hasVotedForQuestion(questionId) {
  if (typeof window === "undefined") return false;
  const suffix = getStorageSuffix();
  const voted = localStorage.getItem(`game-voted-${questionId}${suffix}`);
  return voted === "true";
}

/**
 * Mark a question as voted in localStorage.
 */
export function markVoted(questionId) {
  if (typeof window === "undefined") return;
  const suffix = getStorageSuffix();
  localStorage.setItem(`game-voted-${questionId}${suffix}`, "true");
}
