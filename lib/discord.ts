import { DiscordSDK } from "@discord/embedded-app-sdk";

export type DiscordActivityUser = {
  id: string;
  name: string;
};

export type DiscordActivityContext = {
  isDiscord: boolean;
  roomId: string | null;
  user: DiscordActivityUser | null;
  accessToken: string | null;
};

let discordSdk: DiscordSDK | null = null;
let cachedContext: DiscordActivityContext | null = null;

function canUseDiscordSdk() {
  return (
    typeof window !== "undefined" &&
    window.location !== window.parent.location &&
    !!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  );
}

export function getDiscordSdk() {
  if (!canUseDiscordSdk()) return null;

  if (!discordSdk) {
    discordSdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!);
  }

  return discordSdk;
}

export async function getDiscordActivityContext(): Promise<DiscordActivityContext> {
  if (cachedContext) return cachedContext;

  const sdk = getDiscordSdk();
  if (!sdk) {
    cachedContext = {
      isDiscord: false,
      roomId: null,
      user: null,
      accessToken: null,
    };
    return cachedContext;
  }

  await sdk.ready();

  const { code } = await sdk.commands.authorize({
    client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: ["identify"],
  });

  const tokenRes = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!tokenRes.ok) {
    throw new Error("Failed to exchange Discord OAuth code");
  }

  const { access_token } = await tokenRes.json();

  const auth = await sdk.commands.authenticate({
    access_token,
  });

  if (!auth?.user) {
    throw new Error("Discord authenticate() failed");
  }

  const user = {
    id: auth.user.id,
    name: auth.user.global_name ?? auth.user.username,
  };

  cachedContext = {
    isDiscord: true,
    roomId: sdk.instanceId ?? null,
    user,
    accessToken: access_token,
  };

  return cachedContext;
}