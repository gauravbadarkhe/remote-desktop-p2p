import { useUserMedia } from "../hooks/UserMediaProvider";
import { useMemo, useRef, useEffect } from "react";
import { PackedGrid } from "react-packed-grid";
import { useRoom } from "../hooks/RoomProvider";
import { Buffer } from "buffer/";

import { PeerVideo } from "./PeerVideo";

function GridItemPlaceholder({ children }) {
  return (
    <div
      style={{
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
  const { initRoom, roomId, peers, leaveRoom, sendToAllPeers } = useRoom();

  const {
    stream,
    error,
    latestStreamData,
    stopStreamingData,
    startStream,
    startStreamingData,
    status,
    cancelStream,
  } = useUserMedia({
    constraints: { audio: true, video: true },
    mimeType: "video/webm;codecs=vp9,opus",
    timeSlice: 500,
  });

  const updateLayoutRef = useRef();

  useEffect(() => {
    if (roomId) {
      const start = async () => {
        await startStream();
      };
      if (!stream) start();
      return cancelStream;
    }
  }, [roomId]);

  useEffect(() => {
    if (peers && peers.length > 0) {
      startStreamingData((newData) => {
        sendToAllPeers(Buffer.from(newData));
      });
    }
    return stopStreamingData;
  }, [peers]);

  //
  return (
    <PackedGrid
      className="player-wrapper"
      boxAspectRatio={1}
      updateLayoutRef={updateLayoutRef}
    >
      {roomId && stream && (
        <GridItemPlaceholder key={"localStream"}>
          <PeerVideo localStream={stream} isLocal></PeerVideo>
        </GridItemPlaceholder>
      )}
      {Array.from({ length: peers.length }).map((_, idx) => {
        console.log("idx", idx);
        return (
          <GridItemPlaceholder key={peers[idx]}>
            <PeerVideo remotePeerId={peers[idx]}></PeerVideo>
            {/* <video
              muted
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: "0",
                objectFit: "cover",
              }}
              autoPlay
              ref={(video) => {
                if (video) {
                  video.srcObject = stream;
                }
              }}
              src={stream}
            ></video> */}
          </GridItemPlaceholder>
        );
      })}
    </PackedGrid>
  );
}
