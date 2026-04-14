"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type SubmissionMode = "live" | "manual";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [status, setStatus] = useState<"lobby" | "countdown" | "racing" | "finished">("lobby");
  const [scramble, setScramble] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [manualTime, setManualTime] = useState("");
  const [submitted, setSubmitted] = useState<null | { timeMs: number; mode: SubmissionMode }>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationId: number;
    let startPerf = 0;

    if (status === "racing" && startAt && now >= startAt && !submitted) {
      setRunning(true);
      startPerf = performance.now();

      const tick = () => {
        setElapsedMs(performance.now() - startPerf);
        animationId = requestAnimationFrame(tick);
      };

      animationId = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(animationId);
  }, [status, startAt, now, submitted]);

  const countdown = useMemo(() => {
    if (!startAt || status !== "countdown") return null;
    return Math.max(0, Math.ceil((startAt - now) / 1000));
  }, [startAt, now, status]);

  function generateLocalScramble() {
    const faces = ["U", "D", "L", "R", "F", "B"];
    const modifiers = ["", "'", "2"];
    const moves: string[] = [];
    let prev = "";

    for (let i = 0; i < 20; i++) {
      let face = faces[Math.floor(Math.random() * faces.length)];
      while (face === prev) {
        face = faces[Math.floor(Math.random() * faces.length)];
      }
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      moves.push(face + mod);
      prev = face;
    }

    return moves.join(" ");
  }

  function startRace() {
    setScramble(generateLocalScramble());
    setStartAt(Date.now() + 5000);
    setStatus("countdown");
    setElapsedMs(0);
    setSubmitted(null);

    setTimeout(() => {
      setStatus("racing");
    }, 5000);
  }

  function submitLiveResult() {
    if (!running || submitted) return;
    setRunning(false);
    setSubmitted({ timeMs: Math.round(elapsedMs), mode: "live" });
    setStatus("finished");
  }

  function submitManualResult() {
    if (submitted) return;

    const seconds = Number(manualTime);
    if (Number.isNaN(seconds) || seconds <= 0) return;

    setSubmitted({
      timeMs: Math.round(seconds * 1000),
      mode: "manual",
    });
    setStatus("finished");
  }

  function formatTime(ms: number) {
    const totalCentiseconds = Math.floor(ms / 10);
    const seconds = Math.floor(totalCentiseconds / 100);
    const centiseconds = totalCentiseconds % 100;
    return `${seconds}.${centiseconds.toString().padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-black">Room {roomId}</h1>

        <div className="mt-6">
          <div className="text-sm text-gray-500">Status</div>
          <div className="text-xl font-semibold text-black">{status}</div>
        </div>

        <div className="mt-6">
          <div className="text-sm text-gray-500">Scramble</div>
          <div className="mt-2 rounded-xl bg-gray-100 p-4 font-mono text-lg text-black">
            {scramble ?? "Not generated yet"}
          </div>
        </div>

        {status === "countdown" && (
          <div className="mt-6 text-5xl font-bold text-black">{countdown}</div>
        )}

        {(status === "racing" || submitted) && (
          <div className="mt-6">
            <div className="text-sm text-gray-500">Timer</div>
            <div className="text-6xl font-bold text-black">
              {formatTime(submitted?.timeMs ?? elapsedMs)}
            </div>
          </div>
        )}

        {!scramble && (
          <button
            onClick={startRace}
            className="mt-6 rounded-xl border border-black bg-white px-4 py-2 font-medium text-black transition hover:bg-black hover:text-white"
          >
            Start Local Race
          </button>
        )}

        {status === "racing" && !submitted && (
          <button
            onClick={submitLiveResult}
            className="ml-3 mt-6 rounded-xl border border-black bg-white px-4 py-2 font-medium text-black transition hover:bg-black hover:text-white"
          >
            Solved
          </button>
        )}

        {!submitted && (
          <div className="mt-8">
            <div className="text-sm text-gray-500">Manual entry</div>
            <div className="mt-2 flex gap-3">
              <input
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                placeholder="e.g. 14.32"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-black placeholder:text-gray-400"
              />
              <button
                onClick={submitManualResult}
                className="rounded-xl border border-black bg-white px-4 py-2 font-medium text-black transition hover:bg-black hover:text-white"
              >
                Submit Manual Time
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="mt-6 rounded-xl bg-gray-100 p-4 text-black">
            Submitted {formatTime(submitted.timeMs)} via {submitted.mode}
          </div>
        )}
      </div>
    </main>
  );
}