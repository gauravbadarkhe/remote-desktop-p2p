import { createContext } from "react";

export const _roomContext = {
  room: {
    roomId: null,
    peers: [],
  },
  sendDataToPeers: (data) => {},
};

export const RoomContext = createContext(_roomContext);
