import { useEffect, useRef, useState } from "react";
import type { TimerState, Submission } from "@/lib/types";

export function useTimer(room: any, playerId: string | null) {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [pendingResult, setPendingResult] = useState<Submission | null>(null);

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerState !== "running") return;

    function tick() {
      if (startRef.current !== null) {
        setElapsedMs(performance.now() - startRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }}
  }, [timerState]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!room?.currentScramble || !playerId) return;

      const me = room.players.find((p: any) => p.id === playerId);
      if (me?.submission) return;

      if (e.code !== "Space" || e.repeat) return;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input") return;

      e.preventDefault();

      if (timerState === "idle" || timerState === "stopped") {
        setElapsedMs(0);
        setPendingResult(null);
        setTimerState("holding");
      } else if (timerState === "running") {
        const final =
          startRef.current !== null
            ? performance.now() - startRef.current
            : elapsedMs;

        setElapsedMs(final);
        setPendingResult({ timeMs: Math.round(final), mode: "live" });
        setTimerState("stopped");
        startRef.current = null;
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      if (timerState === "holding") {
        startRef.current = performance.now();
        setTimerState("running");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [room, playerId, timerState, elapsedMs]);

  return {
    timerState,
    elapsedMs,
    pendingResult,
    setPendingResult,
    setElapsedMs,
    setTimerState,
  };
}