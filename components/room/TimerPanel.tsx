import { formatTime } from "@/lib/time";
import type { Submission } from "@/lib/types";

type Props = {
  elapsedMs: number;
  pendingResult: Submission | null;
  timerState: string;
  currentPlayerSubmitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
};

export function TimerPanel({
  elapsedMs,
  pendingResult,
  timerState,
  currentPlayerSubmitted,
  onSubmit,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white shadow-sm p-8 text-center">
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
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={onSubmit}
            className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white"
          >
            Submit {formatTime(pendingResult.timeMs)}
          </button>

          <button
            onClick={onReset}
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:border-black hover:text-black"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}