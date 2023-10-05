import { useEffect, useState } from "react";

export default function useRoom() {
  const [roomId, setRoom] = useState();
  const [peers, setPeers] = useState();

  useEffect(() => {}, [roomId]);

  return [roomId, peers];
}
