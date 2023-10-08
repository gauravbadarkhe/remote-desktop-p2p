import { createContext, useContext, useEffect, useRef, useState } from "react";

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const [roomId, setRoomId] = useState();
  const [peers, setPeers] = useState([]);
  const peersRef = useRef();
  const videoPeers = useRef({});

  peersRef.current = peers;

  const initRoom = async (remoteRoomId) => {
    try {
      console.log(remoteRoomId);
      const roomId = await window.bridge.Room_Init(remoteRoomId);
      console.log(roomId);
      setRoomId(roomId);

      window.bridge.newPeerConnection((peerConn, conn) => {
        videoPeers.current[peerConn] = { callback: null, connectin: conn };
        let newPeers = [...peersRef.current, peerConn];
        setPeers(newPeers);
        // setPeers([1, 2, 3, 4]);
      });

      window.bridge.newData(({ data, remoteId }) => {
        let videoPeerObj = videoPeers.current[remoteId];
        if (videoPeerObj && videoPeerObj.callback) {
          videoPeerObj.callback({ data, remoteId });
        } else {
          console.log("UNable to send data");
        }
        console.log("newData", remoteId, data);
      });
      return;
    } catch (error) {
      console.error(error);
    }
  };

  const leaveRoom = () => {
    console.log("leaveRoom");
    window.bridge.leaveRoom();
    setRoomId(null);
  };

  const sendToAllPeers = (buffer) => {
    window.bridge.sendData(buffer);
  };

  const addDataListerner = (remotePeerId, callback) => {
    videoPeers.current[remotePeerId]["callback"] = callback;
  };

  return (
    <RoomContext.Provider
      value={{
        roomId,
        peers,
        initRoom,
        leaveRoom,
        sendToAllPeers,
        addDataListerner,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
