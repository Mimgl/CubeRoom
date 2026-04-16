"use client";

import { useParams } from "next/navigation";
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

  const { room, playerId, playerName } = useRoomSocket(roomId as string);
  const timer = useTimer(room, playerId);

  const [manualTime, setManualTime] = useState("");

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

  function handleSendFirstScramble() {
    if (!playerId) return;

    getSocket().emit("send_first_scramble", {
      roomId,
      playerId,
    });
  }

  function handleSubmitPendingResult() {
    if (!playerId || !timer.pendingResult) return;

    getSocket().emit("submit_result", {
      roomId,
      playerId,
      submission: timer.pendingResult,
    });
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
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-gray-300 bg-white p-6 shadow-sm">

          <RoomHeader
            room={room}
            playerName={playerName}
            isHost={isHost}
            onSendScramble={handleSendFirstScramble}
          />

          {!room.currentScramble && !isHost && (
            <div className="mt-6 rounded-2xl bg-gray-100 p-4 text-gray-700">
              Waiting for the host to send the first scramble.
            </div>
          )}

          {room.currentScramble && (
            <>
              <ScramblePanel scramble={room.currentScramble} />

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

                <TimerPanel
                  elapsedMs={timer.elapsedMs}
                  pendingResult={timer.pendingResult}
                  timerState={timer.timerState}
                  currentPlayerSubmitted={currentPlayerSubmitted}
                  onSubmit={handleSubmitPendingResult}
                  onReset={() => {
                    timer.setPendingResult(null);
                    timer.setElapsedMs(0);
                    timer.setTimerState("idle");
                  }}
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

              <RoundHistory
                rounds={room.roundHistory}
              />
            </>
          )}

        </div>
      </div>
    </main>
  );
}