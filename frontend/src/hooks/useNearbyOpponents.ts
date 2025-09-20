import { useEffect, useState } from "react";
import {
  startDiscovery,
  stopDiscovery,
  startAdvertise,
  stopAdvertise,
  onPeerFound,
  onPeerLost,
  Strategy,
} from "expo-nearby-connections";
import { Opponent } from "../features/battle/types";

export function useNearbyOpponents(myName: string) {
  const [opponents, setOpponents] = useState<Opponent[]>([]);

  useEffect(() => {
    const unsubFound = onPeerFound(({ peerId, name }) => {
      setOpponents((prev) => [
        ...prev,
        { id: peerId, name: name ?? "ななし", level: Math.floor(Math.random() * 30) + 1 },
      ]);
    });

    const unsubLost = onPeerLost(({ peerId }) => {
      setOpponents((prev) => prev.filter((op) => op.id !== peerId));
    });

    startAdvertise(myName).catch(console.warn);
    startDiscovery(myName, Strategy.P2P_STAR).catch(console.warn);

    return () => {
      unsubFound();
      unsubLost();
      stopDiscovery().catch(() => {});
      stopAdvertise().catch(() => {});
    };
  }, [myName]);

  return { opponents };
}
