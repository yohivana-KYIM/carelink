"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Connexion WebSocket temps réel (notifications, mises à jour de rendez-vous).
 * Se reconnecte automatiquement ; reste `null` tant qu'il n'y a pas de token
 * ou que la connexion n'est pas encore établie — les composants doivent
 * continuer à fonctionner sans (ex: le polling existant reste un filet de
 * sécurité en cas de coupure WebSocket).
 */
export function useSocket(token: string | null | undefined): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const instance = io(API_URL, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    instance.on("connect", () => setSocket(instance));
    instance.on("disconnect", () => setSocket(null));

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [token]);

  return socket;
}
