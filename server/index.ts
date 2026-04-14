import express from "express";
import http from "http";
import next from "next";
import { Server } from "socket.io";
import {
  createRoomIfMissing,
  getRoom,
  joinRoom,
  removePlayer,
  sendFirstScramble,
  submitResult,
} from "./rooms";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

console.log("Starting custom server...");
console.log("NODE_ENV:", process.env.NODE_ENV);

app
  .prepare()
  .then(() => {
    console.log("Next app prepared successfully");

    const expressApp = express();
    const server = http.createServer(expressApp);
    expressApp.use(express.json());
    const io = new Server(server, {
      cors: {
        origin: "*",
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
    expressApp.post("/api/token", async (req, res) => {
        try {
            const { code } = req.body ?? {};

            if (!code) {
            return res.status(400).json({ error: "Missing code" });
            }

            const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "",
            client_secret: process.env.DISCORD_CLIENT_SECRET ?? "",
            grant_type: "authorization_code",
            code,
            redirect_uri: "https://127.0.0.1",
            });

            const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
            });

            const data = await tokenResponse.json();

            if (!tokenResponse.ok) {
            return res.status(tokenResponse.status).json(data);
            }

            return res.json({
            access_token: data.access_token,
            });
        } catch (error) {
            console.error("Discord token exchange failed", error);
            return res.status(500).json({ error: "Token exchange failed" });
        }
        });
        
    expressApp.use((req, res) => handle(req, res));

    server.listen(3000, () => {
      console.log("Server listening on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Failed to start server:");
    console.error(err);
  });