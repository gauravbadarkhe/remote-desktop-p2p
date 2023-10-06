import { useEffect, useState } from "react";

export default function useRoomManager() {
  const [roomId, setRoomId] = useState();
  const [peers, setPeers] = useState([]);

  const initRoom = async (remoteRoomId) => {
    console.log(remoteRoomId);
    const roomId = await window.bridge.Room_Init(remoteRoomId);
    setRoomId(roomId);
    window.bridge.newPeerConnection((peerConn) => {
      setPeers((p) => [...peers, peerConn]);
    });

    window.bridge.newData((data) => {
      console.log("newData", data);
    });
    return;
  };

  const leaveRoom = () => {
    window.bridge.leaveRoom();
    setRoomId();
  };

  return { roomId, peers, initRoom, leaveRoom };
}
