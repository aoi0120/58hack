import { useEffect, useState } from "react";
import type { Opponent } from "../features/battle/types";

export function useNearbyOpponents(myName: string) {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let nearby: any;
    try {
      nearby = require("expo-nearby-connections");
    } catch {
        setError("NearbyConnections のネイティブが見つかりません。Devビルドで起動してください。");
      return;
    }

    const {
      startDiscovery,
      stopDiscovery,
      startAdvertise,
      stopAdvertise,
      onPeerFound,
      onPeerLost,
      Strategy,
    } = nearby;

    if (!startDiscovery || !startAdvertise) {
      setError("NearbyConnections は Expo Go では使えません。Devビルドが必要です。");
      return;
    }

    const seen = new Set<string>();
    const unsubFound = onPeerFound?.(({ peerId, name }: any) => {
      if (seen.has(peerId)) return;
      seen.add(peerId);
      setOpponents((prev) => [
        ...prev,
        { id: peerId, name: name ?? "近くの冒険者", level: Math.floor(Math.random() * 30) + 1 },
      ]);
    });

    const unsubLost = onPeerLost?.(({ peerId }: any) => {
      seen.delete(peerId);
      setOpponents((prev) => prev.filter((op) => op.id !== peerId));
    });

    setScanning(true);
    startAdvertise(myName).catch((e: any) => setError(String(e)));
    startDiscovery(myName, Strategy?.P2P_STAR ?? 0)
      .catch((e: any) => setError(String(e)))
      .finally(() => setScanning(false));

    return () => {
      unsubFound?.();
      unsubLost?.();
      stopDiscovery?.().catch(() => {});
      stopAdvertise?.().catch(() => {});
    };
  }, [myName]);

  return { opponents, scanning, error };
}
