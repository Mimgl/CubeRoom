import { Room, Submission } from "@/lib/types";
import { generateScramble } from "@/lib/scramble";

const rooms = new Map<string, Room>();

export function getRoom(roomId: string) {
  return rooms.get(roomId);
}

export function createRoom(roomId: string, hostId: string, hostName: string): Room {
  const room: Room = {
    id: roomId,
    hostId,
    roundNumber: 0,
    currentScramble: null,
    players: [
      {
        id: hostId,
        name: hostName,
        submission: null,
        solveHistory: [],
        totalWins: 0
      },
    ],
    roundHistory: []
  };

  rooms.set(roomId, room);
  return room;
}

export function joinRoom(roomId: string, playerId: string, playerName: string): Room | null {
  let room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  const existingPlayer = room.players.find((p) => p.id === playerId);
  if (!existingPlayer) {
    room.players.push({
      id: playerId,
      name: playerName,
      submission: null,
      solveHistory: [],
      totalWins: 0,
    });
  }

  return room;
}

export function createRoomIfMissing(roomId: string, playerId: string, playerName: string): Room {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  return createRoom(roomId, playerId, playerName);
}

export function sendFirstScramble(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.hostId !== playerId) return null;
  if (room.currentScramble) return room;

  room.roundNumber = 1;
  room.currentScramble = generateScramble();
  room.players = room.players.map((player) => ({
    ...player,
    submission: null,
  }));

  return room;
}

export function submitResult(
  roomId: string,
  playerId: string,
  submission: Submission
): Room | null {
  const room = rooms.get(roomId);
  if (!room || !room.currentScramble) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player || player.submission) return room;

  player.submission = submission;

  const everyoneSubmitted = room.players.every((p) => p.submission !== null);

  if (everyoneSubmitted && room.currentScramble) {
    const completedResults = room.players
      .filter((p) => p.submission !== null)
      .map((p) => ({
        playerId: p.id,
        playerName: p.name,
        submission: p.submission!,
      }))
      .sort((a, b) => a.submission.timeMs - b.submission.timeMs);

    room.roundHistory.push({
      roundNumber: room.roundNumber,
      scramble: room.currentScramble,
      results: completedResults,
    });

    const winnerId = completedResults[0]?.playerId;

    room.players = room.players.map((player) => {
      const submittedSolve = player.submission;

      return {
        ...player,
        solveHistory: submittedSolve
          ? [...player.solveHistory, submittedSolve]
          : player.solveHistory,
        totalWins:
          player.id === winnerId ? player.totalWins + 1 : player.totalWins,
        submission: null,
      };
    });

    room.roundNumber += 1;
    room.currentScramble = generateScramble();
  }

  return room;
}

export function removePlayer(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }

  if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
  }

  return room;
}