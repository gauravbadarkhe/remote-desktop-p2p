import { useEffect, useState } from "react";

export default function useRoom() {
  const [roomId, setRoomId] = useState();
  const [peers, setPeers] = useState([]);

  const initRoom = async (id) => {
    const roomId = await window.bridge.Room_Init(roomId);
    setRoomId(roomId);
  };

  return { roomId, peers, initRoom };
}
