import React, { useState, useCallback, useRef, useEffect } from "react";
import { Buffer } from "buffer/";

import { PackedGrid } from "react-packed-grid";
import ReactPlayer from "react-player";
import { useUserMedia } from "../hooks/UserMediaProvider";
import { useRoom } from "../hooks/RoomProvider";

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
    mimeType: "video/webm;codecs=vp9,opus",
    recorderTimeSlice: 50,
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
  const [numBoxes, setNumBoxes] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(1);
  const videoRef = useRef();
  const sourceBufferRef = useRef();
  const mediaSource = new MediaSource();

  useEffect(() => {
    const start = async () => {
      await startStream();
    };
    if (!stream) {
      start();
    } else {
      mediaSource.addEventListener("sourceopen", () => {
        sourceBufferRef.current = mediaSource.addSourceBuffer(
          "video/webm;codecs=vp9,opus"
        );

        startStreamingData((newData) => {
          sendToAllPeers(Buffer.from(newData));
          // sourceBufferRef.current.appendBuffer(Buffer.from(newData));
        });
      });
      mediaSource.addEventListener("sourceclose", (e) =>
        console.log("sourceclose", e)
      );
      mediaSource.addEventListener("sourceended", (e) =>
        console.log("sourceended", e)
      );

      videoRef.current.src = URL.createObjectURL(mediaSource);
    }

    return () => {
      cancelStream();
      stopStreamingData();
    };
  }, [roomId]);

  useEffect(() => {
    if (peers && peers.length > 0) {
      addDataListerner(peers[0], ({ data, remoteId }) => {
        sourceBufferRef.current.appendBuffer(data);
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
            type="number"
            min="1"
            value={numBoxes}
            onChange={(e) => setNumBoxes(Number.parseInt(e.target.value, 10))}
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
            await initRoom();
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

        {Array.from({ length: numBoxes }).map((_, idx) => (
          <GridItemPlaceholder key={idx} stream={stream}>
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
        ))}
      </PackedGrid>
    </>
  );
};

export default ResponsiveApp;
