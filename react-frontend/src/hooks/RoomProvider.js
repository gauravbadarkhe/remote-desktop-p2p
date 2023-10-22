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
      const newPeerConnection = (peerConn) => {
        videoPeers.current[peerConn] = { callback: null };
        let newPeers = [...peersRef.current, peerConn];
        console.log("newPeers", newPeers);
        setPeers(newPeers);
        // setPeers([1, 2, 3, 4]);
      };

      const peerConnectionClosed = (peerConn) => {
        const index = peersRef.current.indexOf(peerConn);
        console.log("Peer Removed", peerConn, index, peers);
        delete videoPeers.current[peerConn];

        setPeers(peersRef.current.filter((_, i) => i !== index));
      };

      const newData = ({ data, remoteId }) => {
        let videoPeerObj = videoPeers.current[remoteId];
        if (videoPeerObj && videoPeerObj.callback) {
          videoPeerObj.callback({ data, remoteId });
        } else {
          console.log("UNable to send data", videoPeers.current);
        }
        // console.log("newData", remoteId, data);
      };

      const roomId = await window.bridge.Room_Init(
        remoteRoomId,
        newPeerConnection,
        peerConnectionClosed,
        newData
      );
      console.log(roomId);
      setRoomId(roomId);

      return;
    } catch (error) {
      console.error(error);
    }
  };

  const leaveRoom = () => {
    console.log("leaveRoom");
    window.bridge.leaveRoom();
    setRoomId(null);
    setPeers([]);
  };

  const sendToAllPeers = (buffer) => {
    window.bridge.sendData(buffer);
  };

  const addDataListerner = (remotePeerId, callback) => {
    if (!videoPeers.current[remotePeerId]) {
      console.log("Cannot add Callback", videoPeers.current);
    } else {
      console.log("Adding Listerer For Peer", remotePeerId);
      videoPeers.current[remotePeerId]["callback"] = callback;
      console.log(videoPeers.current);
    }
  };

  const removeDataListerner = (remotePeerId) => {
    if (videoPeers.current[remotePeerId]) {
      videoPeers.current[remotePeerId]["callback"] = null;
      console.log("removeDataListerner ", remotePeerId);
    }
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
        removeDataListerner,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
