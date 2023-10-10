import React, { useState, useCallback, useRef, useEffect } from "react";

import { PackedGrid } from "react-packed-grid";
import ReactPlayer from "react-player";
import { useUserMedia } from "../hooks/UserMediaProvider";
import { useRoom } from "../hooks/RoomProvider";
import { forIn } from "lodash";

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
  const CODECS = "video/webm;codecs=vp9,opus";
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
      mediaSource.current = new MediaSource();
      mediaSource.current.addEventListener("sourceclose", (...e) =>
        console.log("sourceclose", ...e)
      );
      mediaSource.current.addEventListener("sourceended", (...e) =>
        console.log("sourceended", ...e)
      );

      mediaSource.current.addEventListener("sourceopen", () => {
        sourceBufferRef.current = mediaSource.current.addSourceBuffer(CODECS);

        startStreamingData((newData) => {
          sendToAllPeers(newData);
        });

        addDataListerner(peers[0], ({ data, remoteId }) => {
          console.log(mediaSource.current.readyState, "New Data", remoteId);

          if (sourceBufferRef.current) {
            try {
              if (sourceBufferRef.current) {
                sourceBufferRef.current.appendBuffer(data);
              }
              // const blob = new Blob([data], { type: CODECS });
              // const fileReader = new FileReader();
              // fileReader.onloadend = () =>
              //   sourceBufferRef.current.appendBuffer(fileReader.result);
              // fileReader.readAsArrayBuffer(blob);
            } catch (error) {
              console.error(error);
            }
          }
        });
      });

      videoRef.current.src = URL.createObjectURL(mediaSource.current);
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
        <GridItemPlaceholder key={1000} stream={stream}>
          <video
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: "0",
              objectFit: "cover",
            }}
            autoPlay
            ref={videoRef}
            //   src={stream}
          ></video>
        </GridItemPlaceholder>

        <GridItemPlaceholder key={1} stream={stream}>
          <video
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
            //   src={stream}
          ></video>
        </GridItemPlaceholder>

        {/* {Array.from({ length: peers.length }).map((_, idx) => (
         
        ))} */}
      </PackedGrid>
    </>
  );
};

export default ResponsiveApp;
