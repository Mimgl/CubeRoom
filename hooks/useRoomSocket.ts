import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import type { Room } from "@/lib/types";

export function useRoomSocket(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("You");

  useEffect(() => {
    let activeId = "";

    const name = localStorage.getItem("cube-racer-player-name") || "You";
    let id = localStorage.getItem("cube-racer-player-id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("cube-racer-player-id", id);
    }

    setPlayerId(id);
    setPlayerName(name);
    activeId = id;

    const socket = getSocket();

    socket.emit("join_room", {
      roomId,
      playerId: id,
      playerName: name,
    });

    socket.on("room_updated", setRoom);

    return () => {
      socket.off("room_updated", setRoom);
      socket.emit("leave_room", { roomId, playerId: activeId });
    };
  }, [roomId]);

  return { room, playerId, playerName };
}