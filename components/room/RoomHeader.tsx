type Props = {
  room: any;
  playerName: string;
  isHost: boolean;
  onSendScramble: () => void;
  onLeaveRoom: () => void;
};

export function RoomHeader({ room, playerName, isHost, onSendScramble, onLeaveRoom }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-gray-200 dark:border-gray-700 pb-4 shrink-0">
      <div>
        <h1 className="text-2xl font-bold">Room {room.id}</h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Player: <span className="font-medium text-black dark:text-white">{playerName}</span>

          {isHost && (
            <span className="ml-2 rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              Host
            </span>
          )}
        </p>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {room.currentScramble
            ? `Round ${room.roundNumber}`
            : "No scramble sent yet"}
        </p>
      </div>

      <div className="flex gap-2">
        {!room.currentScramble && isHost && (
          <button
            onClick={onSendScramble}
            className="rounded-2xl border border-black dark:border-gray-300 bg-white dark:bg-gray-800 px-4 py-3 font-medium transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Send Scramble
          </button>
        )}

        <button
          onClick={onLeaveRoom}
          className="rounded-2xl border border-red-500 bg-white dark:bg-gray-800 px-4 py-3 font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
