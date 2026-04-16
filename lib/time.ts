export function formatTime(ms: number) {
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

export function calculateSessionAverage(solves: { timeMs: number }[]) {
  if (solves.length === 0) return null;
  return solves.reduce((sum, s) => sum + s.timeMs, 0) / solves.length;
}

export function calculateAo5(solves: { timeMs: number }[]) {
  if (solves.length < 5) return null;

  const sorted = [...solves.slice(-5).map(s => s.timeMs)].sort((a, b) => a - b);
  return (sorted[1] + sorted[2] + sorted[3]) / 3;
}