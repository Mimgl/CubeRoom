import { calculateAo5, calculateSessionAverage, formatTime } from "@/lib/time";

export function ResultsTable({ players, playerId }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-4 py-2.5 font-medium">Player</th>
            <th className="px-4 py-2.5 font-medium">Current</th>
            <th className="px-4 py-2.5 font-medium">Ao5</th>
            <th className="px-4 py-2.5 font-medium">Avg</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {players.map((p: any) => {
            const ao5 = calculateAo5(p.solveHistory);
            const avg = calculateSessionAverage(p.solveHistory);

            return (
              <tr key={p.id}>
                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                  {p.name} {p.id === playerId && <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-500">(You)</span>}
                </td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{p.submission ? formatTime(p.submission.timeMs) : "-"}</td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{ao5 ? formatTime(ao5) : "-"}</td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{avg ? formatTime(avg) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
