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
    <div className="rounded-2xl border border-gray-200 p-6">
      <div className="text-sm font-medium text-gray-500">
        Manual entry
      </div>

      <div className="mt-4 flex gap-3">
        <input
          value={manualTime}
          onChange={(e) => setManualTime(e.target.value)}
          placeholder="e.g. 14.32"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none focus:border-black disabled:bg-gray-100"
        />

        <button
          onClick={onSubmit}
          disabled={disabled}
          className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
        >
          Submit
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-600">
        Use this if you want to enter a time manually instead of using the spacebar timer.
      </p>
    </div>
  );
}