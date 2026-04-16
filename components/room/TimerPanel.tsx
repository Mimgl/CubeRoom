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
    <div className="flex flex-col items-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 text-center">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Timer</div>

      <div className="mt-1.5 text-5xl font-bold tracking-tight">
        {formatTime(pendingResult?.timeMs ?? elapsedMs)}
      </div>

      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {!currentPlayerSubmitted && timerState === "idle" && "Hold space to prepare"}
        {!currentPlayerSubmitted && timerState === "holding" && "Release space to start"}
        {!currentPlayerSubmitted && timerState === "running" && "Press space to stop"}
        {!currentPlayerSubmitted && timerState === "stopped" && "Review and submit your solve"}
        {currentPlayerSubmitted && "You have already submitted for this round"}
      </div>

      {pendingResult && !currentPlayerSubmitted && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={onSubmit}
            className="rounded-2xl border border-black dark:border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Submit {formatTime(pendingResult.timeMs)}
          </button>

          <button
            onClick={onReset}
            className="rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:border-black dark:hover:border-gray-200 hover:text-black dark:hover:text-white"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
