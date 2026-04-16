import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  createRoomIfMissing,
  getRoom,
  joinRoom,
  removePlayer,
  sendFirstScramble,
  submitResult,
} from "./rooms";

const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const expressApp = express();
const server = http.createServer(expressApp);
expressApp.use(express.json());

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_room", ({ roomId, playerId, playerName }) => {
    let room = getRoom(roomId) || null;

    if (!room) {
      room = createRoomIfMissing(roomId, playerId, playerName);
    } else {
      room = joinRoom(roomId, playerId, playerName);
    }

    if (!room) return;

    socket.join(roomId);
    io.to(roomId).emit("room_updated", room);
  });

  socket.on("send_first_scramble", ({ roomId, playerId }) => {
    const room = sendFirstScramble(roomId, playerId);
    if (!room) return;

    io.to(roomId).emit("room_updated", room);
  });

  socket.on("submit_result", ({ roomId, playerId, submission }) => {
    const room = submitResult(roomId, playerId, submission);
    if (!room) return;

    io.to(roomId).emit("room_updated", room);
  });

  socket.on("leave_room", ({ roomId, playerId }) => {
    const room = removePlayer(roomId, playerId);

    if (room) {
      io.to(roomId).emit("room_updated", room);
    }
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
