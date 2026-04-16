type Props = {
  manualTime: string;
  setManualTime: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export function ManualEntryPanel({
  manualTime,
  setManualTime,
  onSubmit,
  disabled,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Manual entry
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={manualTime}
          onChange={(e) => setManualTime(e.target.value)}
          placeholder="e.g. 14.32"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-black dark:focus:border-gray-300 disabled:bg-gray-100 dark:disabled:bg-gray-600"
        />

        <button
          onClick={onSubmit}
          disabled={disabled}
          className="rounded-2xl border border-black dark:border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:cursor-not-allowed disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:hover:bg-white dark:disabled:hover:bg-gray-800"
        >
          Submit
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Use this if you want to enter a time manually instead of using the spacebar timer.
      </p>
    </div>
  );
}
