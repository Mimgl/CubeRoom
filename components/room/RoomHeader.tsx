type Props = {
  room: any;
  playerName: string;
  isHost: boolean;
  onSendScramble: () => void;
};

export function RoomHeader({ room, playerName, isHost, onSendScramble }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-gray-200 pb-6">
      <div>
        <h1 className="text-3xl font-bold">Room {room.id}</h1>

        <p className="mt-2 text-sm text-gray-600">
          Player: <span className="font-medium text-black">{playerName}</span>

          {isHost && (
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
              Host
            </span>
          )}
        </p>

        <p className="mt-1 text-sm text-gray-600">
          {room.currentScramble
            ? `Round ${room.roundNumber}`
            : "No scramble sent yet"}
        </p>
      </div>

      {!room.currentScramble && isHost && (
        <button
          onClick={onSendScramble}
          className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white"
        >
          Send Scramble
        </button>
      )}
    </div>
  );
}