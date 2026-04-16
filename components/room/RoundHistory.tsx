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
  if (!rounds || rounds.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 p-6">
      <div className="text-sm font-medium text-gray-500">
        Round history
      </div>

      <div className="mt-1 text-sm text-gray-600">
        Completed rounds are kept here. The winning solve stays highlighted.
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-4 pb-2">
          {[...rounds].reverse().map((round) => (
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
                          isWinner
                            ? "text-green-600 font-semibold"
                            : "text-gray-700"
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
  );
}