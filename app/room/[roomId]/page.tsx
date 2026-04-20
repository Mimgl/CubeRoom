"use client";

import { useParams, useRouter } from "next/navigation";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useTimer } from "@/hooks/useTimer";
import { getSocket } from "@/lib/socket";
import { useState } from "react";
import { RoomHeader } from "@/components/room/RoomHeader";
import { ScramblePanel } from "@/components/room/ScramblePanel";
import { TimerPanel } from "@/components/room/TimerPanel";
import { ManualEntryPanel } from "@/components/room/ManualEntryPanel";
import { ResultsTable } from "@/components/room/ResultsTable";
import { RoundHistory } from "@/components/room/RoundHistory";

export default function Page() {
  const { roomId } = useParams();
  const router = useRouter();

  const { room, playerId, playerName } = useRoomSocket(roomId as string);
  const timer = useTimer(room, playerId);

  const [manualTime, setManualTime] = useState("");

  if (!room) {
    return (
      <main className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 text-black dark:text-white">
        <div className="rounded-3xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h1 className="text-3xl font-bold">Room {roomId}</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Joining room...</p>
        </div>
      </main>
    );
  }

  const isHost = room.hostId === playerId;
  const me = room.players.find((p) => p.id === playerId);
  const currentPlayerSubmitted = !!me?.submission;

  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.submission && b.submission) {
      return a.submission.timeMs - b.submission.timeMs;
    }
    if (a.submission) return -1;
    if (b.submission) return 1;
    return 0;
  });

  function resetTimer() {
    timer.setPendingResult(null);
    timer.setElapsedMs(0);
    timer.setTimerState("idle");
  }

  function handleLeaveRoom() {
    router.push("/");
  }

  function handleSendFirstScramble() {
    if (!playerId) return;

    getSocket().emit("send_first_scramble", { roomId, playerId });
  }

  function handleSubmitPendingResult() {
    if (!playerId || !timer.pendingResult) return;

    getSocket().emit("submit_result", {
      roomId,
      playerId,
      submission: timer.pendingResult,
    });

    resetTimer();
  }

  function handleSubmitManualResult() {
    if (!playerId) return;

    const seconds = Number(manualTime);
    if (Number.isNaN(seconds) || seconds <= 0) return;

    getSocket().emit("submit_result", {
      roomId,
      playerId,
      submission: {
        timeMs: Math.round(seconds * 1000),
        mode: "manual",
      },
    });

    setManualTime("");
    resetTimer();
  }

  return (
    <main className="h-full overflow-hidden flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4 text-black dark:text-white">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col rounded-3xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm w-full max-w-7xl">

        <RoomHeader
          room={room}
          playerName={playerName}
          isHost={isHost}
          onSendScramble={handleSendFirstScramble}
          onLeaveRoom={handleLeaveRoom}
        />

        {!room.currentScramble && !isHost && (
          <div className="mt-4 rounded-2xl bg-gray-100 dark:bg-gray-700 p-4 text-gray-700 dark:text-gray-300">
            Waiting for the host to send the first scramble.
          </div>
        )}

        {room.currentScramble && (
          <div className="flex-1 min-h-0 flex gap-5 overflow-hidden mt-4">

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
              <ScramblePanel scramble={room.currentScramble} />

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <TimerPanel
                  elapsedMs={timer.elapsedMs}
                  pendingResult={timer.pendingResult}
                  timerState={timer.timerState}
                  currentPlayerSubmitted={currentPlayerSubmitted}
                  onSubmit={handleSubmitPendingResult}
                  onReset={resetTimer}
                />

                <ManualEntryPanel
                  manualTime={manualTime}
                  setManualTime={setManualTime}
                  onSubmit={handleSubmitManualResult}
                  disabled={currentPlayerSubmitted}
                />
              </div>

              <ResultsTable
                players={sortedPlayers}
                playerId={playerId}
              />
            </div>

            {/* Round history sidebar */}
            <div className="w-72 shrink-0 overflow-hidden flex flex-col min-h-0 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <RoundHistory rounds={room.roundHistory} />
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
