import React, { useState, useCallback, useRef, useEffect } from "react";

import { PackedGrid } from "react-packed-grid";
import ReactPlayer from "react-player";
import { useUserMedia } from "../hooks/UserMediaProvider";
import { useRoom } from "../hooks/RoomProvider";
import { forIn } from "lodash";
import PeerVideo from "./PeerVideo";
import { CODECS } from "../constants";

function GridItemPlaceholder({ children }) {
  return (
    <div
      style={{
        backgroundColor: "whitesmoke",
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

const ResponsiveApp = () => {
  const {
    stream,
    error,
    startStream,
    startStreamingData,
    cancelStream,
    stopStreamingData,
  } = useUserMedia({
    constraints: { audio: true, video: true },
    mimeType: CODECS,
    recortimeSlicederTimeSlice: 50,
  });

  const {
    initRoom,
    roomId,
    peers,
    leaveRoom,
    sendToAllPeers,
    addDataListerner,
  } = useRoom();

  const updateLayoutRef = useRef();
  const focusRef = useCallback((el) => {
    el.focus();
  }, []);
  const [numBoxes, setNumBoxes] = useState();
  const [aspectRatio, setAspectRatio] = useState(1);
  const videoRef = useRef();
  const sourceBufferRef = useRef();
  const mediaSource = useRef();

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
        sendToAllPeers(newData);
      });
    }
  }, [peers]);

  return (
    <>
      <div className="controls">
        <label>
          Boxes
          <input
            ref={focusRef}
            value={numBoxes}
            onChange={(e) => setNumBoxes(e.target.value)}
          />
        </label>
        <label>
          Aspect Ratio
          <input
            ref={focusRef}
            type="number"
            step="any"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(Number.parseFloat(e.target.value))}
          />
        </label>
        <button
          onClick={() => {
            if (updateLayoutRef.current) {
              updateLayoutRef.current();
            }
          }}
        >
          Force Layout Update
        </button>
        <button
          onClick={async () => {
            await initRoom(numBoxes);
          }}
        >
          Room
        </button>
      </div>
      <PackedGrid
        boxAspectRatio={1}
        className="fullscreen"
        updateLayoutRef={updateLayoutRef}
      >
        {/* <GridItemPlaceholder key={100} stream={stream}>
          <PeerVideo></PeerVideo>
        </GridItemPlaceholder> */}

        {stream && (
          <GridItemPlaceholder key={1000} stream={stream}>
            <PeerVideo
              remotePeerId={"NA"}
              isLocal
              localStream={stream}
            ></PeerVideo>
          </GridItemPlaceholder>
        )}
        {/* <GridItemPlaceholder key={343}>
          {peers && peers.length > 0 && (
            <video
              muted
              className="peer-video"
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: "0",
                objectFit: "cover",
              }}
              ref={videoRef}
              //   ref={(video) => {
              //     if (video && localStream) {
              //       video.srcObject = localStream;
              //     }
              //   }}
            ></video>
          )}
        </GridItemPlaceholder> */}
        {Array.from({ length: peers.length }).map((_, idx) => {
          return (
            <GridItemPlaceholder key={idx}>
              <PeerVideo remotePeerId={peers[idx]}></PeerVideo>
            </GridItemPlaceholder>
          );
        })}
      </PackedGrid>
    </>
  );
};

export default ResponsiveApp;
