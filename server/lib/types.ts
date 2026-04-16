export type SubmissionMode = "live" | "manual";
export type TimerState = "idle" | "holding" | "running" | "stopped";

export interface Submission {
  timeMs: number;
  mode: SubmissionMode;
}

export interface Player {
  id: string;
  name: string;
  submission: Submission | null;
  solveHistory: Submission[];
  totalWins: number;
}

export interface RoundResult {
  roundNumber: number;
  scramble: string;
  results: {
    playerId: string;
    playerName: string;
    submission: Submission;
  }[];
}

export interface Room {
  id: string;
  hostId: string;
  roundNumber: number;
  currentScramble: string | null;
  players: Player[];
  roundHistory: RoundResult[];
}
