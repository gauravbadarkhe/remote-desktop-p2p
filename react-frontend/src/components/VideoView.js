import { useUserMedia } from "../hooks/UserMediaProvider";
import { useMemo, useRef, useEffect } from "react";
import { PackedGrid } from "react-packed-grid";
import { useRoom } from "../hooks/RoomProvider";
import { Buffer } from "buffer/";
import cenc from "compact-encoding";
import PeerVideo from "./PeerVideo";

function GridItemPlaceholder({ children, id }) {
  return (
    <div
      style={{
        id: { id },
        display: "grid",
        placeContent: "center",
        position: "relative",
        width: "100%",
        height: "100%",
        border: "2px solid black",
      }}
    >
      {children}
    </div>
  );
}

export function VideoView() {
  const { roomId, peers, sendToAllPeers } = useRoom();
  const {
    stream,
    stopStreamingData,
    startStream,
    startStreamingData,
    cancelStream,
  } = useUserMedia({
    constraints: {
      audio: {
        noiseSuppression: true,
        echoCancellation: true, // Optional: Enable echo cancellation
      },
      video: true,
    },
    mimeType: "video/webm;codecs=vp9,opus",
    timeSlice: 200,
  });

  const updateLayoutRef = useRef();

  useEffect(() => {
    if (roomId) {
      const start = async () => {
        await startStream();
      };
      if (!stream) start();
      return async () => {
        cancelStream();
        await stopStreamingData();
      };
    }
  }, [roomId]);

  useEffect(() => {
    if (stream) {
      startStreamingData((newData) => {
        sendToAllPeers(cenc.encode(cenc.json, newData));
      });

      return async () => {
        await stopStreamingData();
      };
    }
  }, [stream]);

  //
  return (
    <PackedGrid
      className="player-wrapper"
      boxAspectRatio={1}
      updateLayoutRef={updateLayoutRef}
    >
      {roomId && stream && (
        <GridItemPlaceholder key={"localStream"} id={"local"}>
          <PeerVideo localStream={stream} isLocal></PeerVideo>
        </GridItemPlaceholder>
      )}
      {Array.from({ length: peers.length }).map((_, idx) => {
        return (
          <GridItemPlaceholder key={peers[idx]} id={peers[idx]}>
            <PeerVideo remotePeerId={peers[idx]}></PeerVideo>
          </GridItemPlaceholder>
        );
      })}
    </PackedGrid>
  );
}
