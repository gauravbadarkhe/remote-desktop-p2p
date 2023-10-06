import { Box, Container, Grid, Stack } from "@mui/material";
import ReactPlayer from "react-player";
import { useUserMedia } from "../logicalComponents/UserMediaProvider";
import { useMemo, useRef, useEffect } from "react";
import { PackedGrid } from "react-packed-grid";
import { useRoom } from "../logicalComponents/RoomProvider";

export function VideoContainer(stream) {
  return (
    <ReactPlayer
      style={{
        margin: "0",
        padding: "0",
        borderRadius: "8px",
      }}
      autoPlay
      src="https://tekeye.uk/html/images/Joren_Falls_Izu_Jap.mp4"
      type="video/mp4"
      muted
    ></ReactPlayer>
  );
}

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
  const { stream, error } = useUserMedia({ audio: true, video: true });
  // const { status, startRecording, stopRecording, mediaBlobUrl } =
  //   useReactMediaRecorder({ video: true });
  const updateLayoutRef = useRef();
  const { initRoom, roomId, peers, leaveRoom } = useRoom();

  //
  return (
    <PackedGrid
      className="player-wrapper"
      boxAspectRatio={1}
      updateLayoutRef={updateLayoutRef}
    >
      {Array.from({ length: peers.length }).map((_, idx) => (
        <GridItemPlaceholder key={peers[idx]}>
          <video
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
          ></video>
        </GridItemPlaceholder>
      ))}
    </PackedGrid>
  );
}
