export function ScramblePanel({ scramble }: { scramble: string }) {
  return (
    <div className="shrink-0">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Current scramble
      </div>

      <div className="mt-1.5 rounded-2xl bg-gray-100 dark:bg-gray-700 p-2.5 font-mono text-sm">
        {scramble}
      </div>
    </div>
  );
}
