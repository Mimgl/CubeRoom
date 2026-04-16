"use client";

import { formatTime } from "@/lib/time";

type RoundResult = {
  playerId: string;
  playerName: string;
  submission: {
    timeMs: number;
  };
};

type Round = {
  roundNumber: number;
  scramble: string;
  results: RoundResult[];
};

type Props = {
  rounds: Round[];
};

export function RoundHistory({ rounds }: Props) {
  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">
        Round history
      </div>

      {rounds.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
          Completed rounds will appear here.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3 overflow-y-auto min-h-0">
          {[...rounds].reverse().map((round) => (
            <div
              key={round.roundNumber}
              className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 shrink-0"
            >
              <div className="font-semibold text-sm text-black dark:text-white">
                Round {round.roundNumber}
              </div>

              <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400 break-words">
                {round.scramble}
              </div>

              <div className="mt-2 space-y-1.5">
                {round.results.map((result, index) => (
                  <div
                    key={result.playerId}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-2"
                  >
                    <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      #{index + 1}
                    </div>

                    <div className="truncate text-xs font-medium text-black dark:text-white">
                      {result.playerName}
                    </div>

                    <div
                      className={`font-mono text-xs ${
                        index === 0
                          ? "text-green-600 dark:text-green-400 font-semibold"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {formatTime(result.submission.timeMs)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
