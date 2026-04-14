"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import type { Room, Submission, TimerState } from "@/lib/types";

function formatTime(ms: number) {
  const totalCentiseconds = Math.floor(ms / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${seconds}.${centiseconds.toString().padStart(2, "0")}`;
}

function calculateSessionAverage(solves: { timeMs: number }[]) {
  if (solves.length === 0) return null;

  const total = solves.reduce((sum, solve) => sum + solve.timeMs, 0);
  return total / solves.length;
}

function calculateAo5(solves: { timeMs: number }[]) {
  if (solves.length < 5) return null;

  const lastFive = solves.slice(-5).map((solve) => solve.timeMs);
  const sorted = [...lastFive].sort((a, b) => a - b);

  const middleThree = sorted.slice(1, 4);
  const total = middleThree.reduce((sum, time) => sum + time, 0);

  return total / 3;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [isDiscordActivity, setIsDiscordActivity] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("You");

  const [manualTime, setManualTime] = useState("");
  const [pendingResult, setPendingResult] = useState<Submission | null>(null);

  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const startPerfRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let activePlayerId = "";
    let cancelled = false;

    async function bootstrap() {
      try {
        const { getDiscordActivityContext } = await import("@/lib/discord");
        const discordCtx = await getDiscordActivityContext();
        setIsDiscordActivity(discordCtx.isDiscord);
        let resolvedName = localStorage.getItem("cube-racer-player-name") || "You";
        let resolvedPlayerId = localStorage.getItem("cube-racer-player-id");

        if (discordCtx.isDiscord && discordCtx.user) {
          resolvedName = discordCtx.user.name;
          resolvedPlayerId = discordCtx.user.id;
          localStorage.setItem("cube-racer-player-name", resolvedName);
          localStorage.setItem("cube-racer-player-id", resolvedPlayerId);
        }

        if (!resolvedPlayerId) {
          resolvedPlayerId = crypto.randomUUID();
          localStorage.setItem("cube-racer-player-id", resolvedPlayerId);
        }

        if (cancelled) return;

        activePlayerId = resolvedPlayerId;
        setPlayerName(resolvedName);
        setPlayerId(resolvedPlayerId);
        console.log("Trying to create socket");
        const socket = getSocket();

        socket.emit("join_room", {
          roomId,
          playerId: resolvedPlayerId,
          playerName: resolvedName,
        });

        const handleRoomUpdated = (updatedRoom: Room) => {
          setRoom(updatedRoom);

          const me = updatedRoom.players.find((p) => p.id === resolvedPlayerId);
          if (me?.submission) {
            setPendingResult(null);
            setTimerState("stopped");
            setElapsedMs(me.submission.timeMs);
          } else {
            setPendingResult(null);
            setTimerState("idle");
            setElapsedMs(0);
          }
        };

        socket.on("room_updated", handleRoomUpdated);

        return () => {
          socket.off("room_updated", handleRoomUpdated);
        };
      } catch (err) {
        console.error("Room bootstrap failed", err);
      }
    }

    const cleanupPromise = bootstrap();

    return () => {
      cancelled = true;

      cleanupPromise.then((cleanup) => cleanup?.());

      if (activePlayerId) {
        getSocket().emit("leave_room", {
          roomId,
          playerId: activePlayerId,
        });
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (timerState !== "running") {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    function updateTimer() {
      if (startPerfRef.current !== null) {
        setElapsedMs(performance.now() - startPerfRef.current);
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [timerState]);

  useEffect(() => {

    function handleKeyDown(e: KeyboardEvent) {
      if (!room?.currentScramble) return;
      if (!playerId) return;

      const me = room.players.find((p) => p.id === playerId);
      if (me?.submission) return;

      if (e.code !== "Space") return;
      if (e.repeat) return;

      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return;

      e.preventDefault();

      if (timerState === "idle" || timerState === "stopped") {
        setElapsedMs(0);
        setPendingResult(null);
        setTimerState("holding");
        return;
      }

      if (timerState === "running") {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        const finalTime =
          startPerfRef.current !== null
            ? performance.now() - startPerfRef.current
            : elapsedMs;

        setElapsedMs(finalTime);
        setPendingResult({
          timeMs: Math.round(finalTime),
          mode: "live",
        });
        setTimerState("stopped");
        startPerfRef.current = null;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (!room?.currentScramble) return;
      if (!playerId) return;

      const me = room.players.find((p) => p.id === playerId);
      if (me?.submission) return;

      if (e.code !== "Space") return;

      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return;

      e.preventDefault();

      if (timerState === "holding") {
        startPerfRef.current = performance.now();
        setTimerState("running");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [room, playerId, timerState]);

  function handleSendFirstScramble() {
    if (!playerId) return;

    const socket = getSocket();
    socket.emit("send_first_scramble", {
      roomId,
      playerId,
    });
  }

  function handleSubmitPendingResult() {
    if (!playerId || !pendingResult) return;

    const socket = getSocket();
    socket.emit("submit_result", {
      roomId,
      playerId,
      submission: pendingResult,
    });
  }

  function handleSubmitManualResult() {
    if (!playerId) return;

    const seconds = Number(manualTime);
    if (Number.isNaN(seconds) || seconds <= 0) return;

    const submission: Submission = {
      timeMs: Math.round(seconds * 1000),
      mode: "manual",
    };

    const socket = getSocket();
    socket.emit("submit_result", {
      roomId,
      playerId,
      submission,
    });

    setManualTime("");
  }

  const isHost = !!room && room.hostId === playerId;
  const me = room?.players.find((p) => p.id === playerId);
  const currentPlayerSubmitted = !!me?.submission;

  const sortedPlayers = useMemo(() => {
    if (!room) return [];
    return [...room.players].sort((a, b) => {
      if (a.submission && b.submission) {
        return a.submission.timeMs - b.submission.timeMs;
      }
      if (a.submission) return -1;
      if (b.submission) return 1;
      return 0;
    });
  }, [room]);

  if (!room) {
    return (
      <main className="min-h-screen bg-gray-100 p-6 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-300 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">Room {roomId}</h1>
          <p className="mt-4 text-gray-600">Joining room...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Room {room.id}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Player: <span className="font-medium text-black">{playerName}</span>
                {isHost && (
                  <span className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                    Host
                  </span>
                )}

                {isDiscordActivity && (
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                    Discord Activity
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {room.currentScramble ? `Round ${room.roundNumber}` : "No scramble sent yet"}
              </p>
            </div>

            {!room.currentScramble && isHost && (
              <button
                onClick={handleSendFirstScramble}
                className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white"
              >
                Send Scramble
              </button>
            )}
          </div>

          {!room.currentScramble && !isHost && (
            <div className="mt-6 rounded-2xl bg-gray-100 p-4 text-gray-700">
              Waiting for the host to send the first scramble.
            </div>
          )}

          {room.currentScramble && (
            <>
              <div className="mt-8">
                <div className="text-sm font-medium text-gray-500">Current scramble</div>
                <div className="mt-2 rounded-2xl bg-gray-100 p-4 font-mono text-xl">
                  {room.currentScramble}
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Timer</div>

                  <div className="mt-3 text-6xl font-bold tracking-tight">
                    {formatTime(pendingResult?.timeMs ?? elapsedMs)}
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    {!currentPlayerSubmitted && timerState === "idle" && "Hold space to prepare"}
                    {!currentPlayerSubmitted && timerState === "holding" && "Release space to start"}
                    {!currentPlayerSubmitted && timerState === "running" && "Press space to stop"}
                    {!currentPlayerSubmitted && timerState === "stopped" && "Review and submit your solve"}
                    {currentPlayerSubmitted && "You have already submitted for this round"}
                  </div>

                  {pendingResult && !currentPlayerSubmitted && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={handleSubmitPendingResult}
                        className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white"
                      >
                        Submit {formatTime(pendingResult.timeMs)}
                      </button>

                      <button
                        onClick={() => {
                          setPendingResult(null);
                          setElapsedMs(0);
                          setTimerState("idle");
                        }}
                        className="rounded-2xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:border-black hover:text-black"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Manual entry</div>

                  <div className="mt-4 flex gap-3">
                    <input
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      placeholder="e.g. 14.32"
                      disabled={currentPlayerSubmitted}
                      className="min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-black disabled:bg-gray-100"
                    />
                    <button
                      onClick={handleSubmitManualResult}
                      disabled={currentPlayerSubmitted}
                      className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
                    >
                      Submit
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    Use this if you want to enter a time manually instead of using the spacebar timer.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 p-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Round results</div>
                  <div className="mt-1 text-sm text-gray-600">
                    When everyone submits, the next scramble is generated automatically.
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-[1fr_100px_100px_120px_80px] items-center border-t border-gray-200 px-4 py-4">
                    <div>Player</div>
                    <div className="text-right">Time</div>
                    <div className="ml-6 text-right">Ao5</div>
                    <div className="ml-6 text-right">Session Avg</div>
                    <div className="ml-6 text-right">Wins</div>
                  </div>

                  {sortedPlayers.map((player) => {
                    const ao5 = calculateAo5(player.solveHistory);
                    const sessionAverage = calculateSessionAverage(player.solveHistory);

                    return (
                      <div
                        key={player.id}
                        className="grid grid-cols-[1fr_100px_100px_120px_80px] items-center border-t border-gray-200 px-4 py-4"
                      >
                        <div className="font-medium">
                          {player.name}
                          {player.id === playerId && (
                            <span className="ml-2 text-sm font-normal text-gray-500">(You)</span>
                          )}
                        </div>

                        <div className="text-right font-mono">
                          {player.submission ? formatTime(player.submission.timeMs) : "—"}
                        </div>

                        <div className="ml-6 text-right font-mono text-sm text-gray-700">
                          {ao5 !== null ? formatTime(ao5) : "—"}
                        </div>

                        <div className="ml-6 text-right font-mono text-sm text-gray-700">
                          {sessionAverage !== null ? formatTime(sessionAverage) : "—"}
                        </div>

                        <div className="ml-6 text-right text-sm text-gray-700">
                          {player.totalWins}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {(room.roundHistory.length ?? 0) > 0 && (
                <div className="mt-8 rounded-2xl border border-gray-200 p-6">
                  <div className="text-sm font-medium text-gray-500">Round history</div>
                  <div className="mt-1 text-sm text-gray-600">
                    Completed rounds are kept here. The winning solve stays highlighted.
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <div className="flex min-w-max gap-4 pb-2">
                      {[...(room.roundHistory ?? [])].reverse().map((round) => (
                        <div
                          key={round.roundNumber}
                          className="w-80 shrink-0 rounded-2xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-black">
                                Round {round.roundNumber}
                              </div>
                              <div className="mt-1 line-clamp-2 font-mono text-xs text-gray-600">
                                {round.scramble}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {round.results.map((result, index) => {
                              const isWinner = index === 0;

                              return (
                                <div
                                  key={result.playerId}
                                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3"
                                >
                                  <div className="text-xs font-medium text-gray-500">
                                    #{index + 1}
                                  </div>

                                  <div className="truncate text-sm font-medium text-black">
                                    {result.playerName}
                                  </div>

                                  <div
                                    className={`font-mono text-sm ${
                                      isWinner ? "text-green-600 font-semibold" : "text-gray-700"
                                    }`}
                                  >
                                    {formatTime(result.submission.timeMs)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
)}
            </>
          )}
        </div>
      </div>
    </main>
  );
}