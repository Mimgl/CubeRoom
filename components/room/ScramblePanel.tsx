export function ScramblePanel({ scramble }: { scramble: string }) {
  return (
    <div className="mt-8">
      <div className="text-sm font-medium text-gray-500">
        Current scramble
      </div>

      <div className="mt-2 rounded-2xl bg-gray-100 p-4 font-mono text-xl">
        {scramble}
      </div>
    </div>
  );
}