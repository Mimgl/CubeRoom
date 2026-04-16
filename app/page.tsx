"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

function getOrCreatePlayerId() {
  const existing = localStorage.getItem("cube-racer-player-id");
  if (existing) return existing;

  const newId = crypto.randomUUID();
  localStorage.setItem("cube-racer-player-id", newId);
  return newId;
}

export default function HomePage() {
  const router = useRouter();

  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  function validateName(name: string) {
    return name.trim().length >= 2;
  }

  function handleCreateRoom() {
    const trimmedName = playerName.trim();

    if (!validateName(trimmedName)) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    setError("");
    localStorage.setItem("cube-racer-player-name", trimmedName);
    getOrCreatePlayerId();

    const roomCode = generateRoomCode();
    router.push(`/room/${roomCode}`);
  }

  function handleJoinRoom() {
    const trimmedName = playerName.trim();
    const trimmedCode = joinCode.trim().toUpperCase();

    if (!validateName(trimmedName)) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    if (trimmedCode.length < 4) {
      setError("Please enter a valid room code.");
      return;
    }

    setError("");
    localStorage.setItem("cube-racer-player-name", trimmedName);
    getOrCreatePlayerId();

    router.push(`/room/${trimmedCode}`);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12 text-black">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-gray-300 bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            CubeRoom
          </h1>

          <p className="mt-3 text-gray-700">
            Race your friends on the same scramble inside a shared room.
          </p>

          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Your name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              onClick={handleCreateRoom}
              className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white"
            >
              Create Room
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                className="min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-black"
              />
              <button
                onClick={handleJoinRoom}
                className="rounded-2xl border border-black bg-white px-4 py-3 font-medium text-black transition hover:bg-black hover:text-white"
              >
                Join
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}