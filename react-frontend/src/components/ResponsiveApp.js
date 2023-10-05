import React, { useState, useCallback, useRef } from "react";

import { PackedGrid } from "react-packed-grid";
import ReactPlayer from "react-player";
import { useUserMedia } from "../logicalComponents/UserMediaProvider";

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
  const { stream, error } = useUserMedia({ audio: true, video: true });
  const updateLayoutRef = useRef();
  const focusRef = useCallback((el) => {
    el.focus();
  }, []);
  const [numBoxes, setNumBoxes] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(1);

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
      </div>
      <PackedGrid
        boxAspectRatio={1}
        className="fullscreen"
        updateLayoutRef={updateLayoutRef}
      >
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
