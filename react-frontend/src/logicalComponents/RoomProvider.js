import { createContext, useContext, useEffect, useRef, useState } from "react";

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const [roomId, setRoomId] = useState();
  const [peers, setPeers] = useState([]);
  const peersRef = useRef();
  peersRef.current = peers;

  useEffect(() => {
    console.log("peers", peers);
  }, [peers]);

  const initRoom = async (remoteRoomId) => {
    try {
      console.log(remoteRoomId);
      const roomId = await window.bridge.Room_Init(remoteRoomId);
      console.log(roomId);
      setRoomId(roomId);

      window.bridge.newPeerConnection((peerConn) => {
        console.log(peerConn);
        let newPeers = [...peersRef.current, peerConn];
        console.log(peers, "newPeers", newPeers);
        setPeers(newPeers);
        // setPeers([1, 2, 3, 4]);
      });

      window.bridge.newData((data) => {
        console.log("newData", data);
      });
      return;
    } catch (error) {
      console.error(error);
    }
  };

  const leaveRoom = () => {
    console.log("leaveRoom");
    window.bridge.leaveRoom();
    setRoomId();
  };

  return (
    <RoomContext.Provider
      value={{
        roomId,
        peers,
        initRoom,
        leaveRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
